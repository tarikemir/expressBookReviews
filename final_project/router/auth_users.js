const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let theBook = books[isbn];
  
  if (!theBook) {
    return res.status(404).send("Book not found");
  }

  let reviewer = req.session.authorization.username;
  let review = req.body.review;

  if (!reviewer || !review) {
    return res.status(400).send("Reviewer and review are required fields");
  }

  if (!theBook.reviews) {
    theBook.reviews = {};
  }

  theBook.reviews[reviewer] = review;

  return res.send("Review added successfully");
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let theBook = books[isbn];
  
  if (!theBook) {
    return res.status(404).send({ error: "Book not found" });
  }

  let reviewer = req.session.authorization.username;

  if (!theBook.reviews[reviewer]) {
    return res.status(404).send({ error: "Review not found" });
  }

  delete theBook.reviews[reviewer];

  return res.send({ message: "Review deleted successfully" });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
