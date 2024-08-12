const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
  // Check if username and password match the one we have in records.
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password)
  })

  // Return true if any user is found.
  if (validUsers.length > 0) {
    return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username
  const password = req.body.password

  // Check username or password missing.
  if (!username || !password) {
    return res.json({message: "Error loggin in."})
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT token.
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 })
    // Store access token & username in session.
    req.session.authorization = {
      accessToken,
      username
    }
    return res.send("Customer successfully logged in")
  } else {
    return res.json({
      message: "Invalid loggin. Check username and password."
    })
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get ISBN from params and find the match in the books.
  const isbn = req.params.isbn
  let book = books[isbn]

  if (book) {
    // Get the review and the user information.
    let review = req.query.review
    const { username } = req.session.authorization

    // If username & review both exists, update the review.
    if (username && review) {
      book.reviews[username] = review
    } else {
      res.send('Unable to update. Username or review not provided.')
    }
    res.send(`The review for the book with ISBN ${isbn} has been added/updated.`)
  } else {
    res.send("Unable to find the book.");
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Get ISBN from params and find the match in the books.
  const isbn = req.params.isbn
  let book = books[isbn]

  if (book) {
    // Get the user information.
    const { username } = req.session.authorization || {}

    // If username and review exists, delete the review of that user.
    if (username) {
      if (book.reviews && book.reviews[username]) {
        delete book.reviews[username]
        res.send(`Reviews for the ISBN ${isbn} by the user ${username} deleted.`)
      } else {
        res.send('No review found for this user.')
      }
    } else {
      res.send('Unable to delete the review. User not authenticated.')
    }
  } else {
    res.send("Unable to delete the review. Book not found.");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
