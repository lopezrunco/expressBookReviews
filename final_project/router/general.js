const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with a given username exists.
const doesExist = (username) => {
  // Filter the users array looking for username matches.
  let userMatches = users.filter((user) => {
    return user.username === username
  })
  // Return true if the username exists, otherwise returns false.
  if (userMatches.length > 0) {
    return true
  } else {
    return false
  }
}

public_users.post("/register", (req,res) => {
  // Obtain username & password from the body.
  const username = req.body.username
  const password = req.body.password

  // Check if username & password are provided.
  if (username && password) {
    // Check if the user does not already exist.
    if (!doesExist(username)) {
      // Add a new user.
      users.push({
        "username": username,
        "password": password
      })

      return res.json({
        message: "Customer successfully registred. Now you can login"
      })
    } else {
      return res.json({
        message: "User already exists."
      })
    }
  } else {
    return res.json({
      message: "Username or password not provided."
    })
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const getAllBooks = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books)
    }, 100);
  })

  getAllBooks.then(data => {
      res.json({"books": data})
    }).catch(error => {
      res.json({ "Error: Unable to get all the books": error })
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const getBookByIsbn = new Promise((resolve, reject) => {
    // Get the ISBN from the params.
    const isbn = req.params.isbn
    // Get the book by ISBN.
    let book = books[isbn]
    resolve(book)
  })

  getBookByIsbn.then(data => {
    res.json(data)
  }).catch(error => {
    res.json({ "Error: Unable to get a book by ISBN": error })
  })
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const getBooksByAuthor = new Promise((resolve, reject) => {
    // Get the author from the params.
    const author = req.params.author
    // Obtain all the keys for the ‘books’ object.
    let keys = Object.keys(books)

    // Iterate the books using the keys and check the author match.
    let filtered_keys = keys.filter((key) => books[key].author === author)

    // Create a new object with the filtered results.
    let filtered_books = filtered_keys.reduce((result, key) => {
      result.push({
        isbn: key,
        title: books[key].title,
        reviews: books[key].reviews
      })
      return result
    }, [])

    resolve(filtered_books)
  })

  getBooksByAuthor.then(data => {
    res.json({"booksbyauthor": data})
  }).catch(error => {
    res.json({ "Error: Unable to get books by author": error })
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Get the title fromn the params.
  const title = req.params.title
  // Obtain all the keys for the ‘books’ object.
  let keys = Object.keys(books)

  // Iterate the books using the keys and check the title match.
  let filtered_keys = keys.filter((key) => books[key].title === title)

  // Create a new object with the filtered results.
  let filtered_books = filtered_keys.reduce((result, key) => {
    result.push({
      isbn: key,
      author: books[key].author,
      reviews: books[key].reviews
    })
    return result
  }, [])

  res.json({"booksbytitle": filtered_books})
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Get the ISBN from the params.
  const isbn = req.params.isbn
  // Get the book by ISBN.
  let book = books[isbn]
  // Return the reviews.
  res.send(book.reviews)
});

module.exports.general = public_users;
