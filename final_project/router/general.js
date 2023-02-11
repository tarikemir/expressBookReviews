const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

  res.send(JSON.stringify(books,null,4));
  return res.status(200);
});
public_users.get('/books', async function (req, res) {
  try {
    let response = await axios.get('http://localhost:5000/');
    let books = response.data;
    return res.status(200).json(books);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error getting the books');
  }
});
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let theBook = books[isbn];
  if (!theBook) {
    return res.status(404).send("Book not found with ISBN: " + isbn);
  }
  return res.status(200).json(theBook);
 });
public_users.get('/books/:isbn', async (req, res) => {
  let isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).send(`Book not found with ISBN: ${isbn}`);
  }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let booksArray = Object.values(books);
  let theOne = booksArray.filter((book) => book.author === author);
  return res.status(200).json(theOne);
});
public_users.get('/authors/:author', (req, res) => {
  let author = req.params.author;
  axios.get('http://localhost:5000/author/author')
    .then(function (response) {
      let booksArray = response.data;
      let theOne = booksArray.filter((book) => book.author === author);
      res.status(200).json(theOne);
    })
    .catch(function (error) {
      console.log(error);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title.replace(/-/g, " ");
  let booksArray = Object.values(books);
  let theOne = booksArray.filter((book) => book.title === title);
  return res.status(200).json(theOne);});

public_users.get('/books/:title', async (req, res) => {
  let title = req.params.title;
  let booksArray = Object.values(books);
  let theOne = booksArray.filter((book) => book.title === title);
  return res.status(200).json(theOne);
});
  
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let theBook = books[isbn];
  if(theBook) {
  return res.status(200).json(theBook.reviews);
  } else {
  return res.status(404).json({
  error: 'Book not found with ISBN: ' + isbn
    });
  }
});

module.exports.general = public_users;
