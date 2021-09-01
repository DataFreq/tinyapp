const { generateRandomString, writeUrlToDisk, writeUserToDisk, activeAccount } = require('./tinyapp-functions');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let users = '';
let urlDatabase = '';
let currentUser = '';

fs.readFile('./data/urlDatabase.json', 'utf8', (err, jsonString) => { // initial load of urlDatabase.json
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  urlDatabase = JSON.parse(jsonString);
});

fs.readFile('./data/userDatabase.json', 'utf8', (err, jsonString) => { // initial load of urlDatabase.json
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  users = JSON.parse(jsonString);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => { //urls_index.ejs
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => { // urls_new.ejs
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => { // urls_show.ejs
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']],
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_register', templateVars);
});

/* <------------- ------- end of app.get -------------------- > */

app.post('/urls/:shortURL/edit', (req, res) => { // Edit button on urls_index.ejs redirects to urls_show.ejs
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = req.body.longURL;
  writeUrlToDisk(urlDatabase, currentUser);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  writeUrlToDisk(urlDatabase, currentUser);
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => { //setting new longURL
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  writeUrlToDisk(urlDatabase, currentUser);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  currentUser = username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  currentUser = '';
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString(users);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password)
    return res.status(404).send("Invalid email or password.");

  if (activeAccount(email, users))
    return res.status(404).send("An account with that email already exists.");

  users[id] = {
    id: id,
    email: email,
    password : password
  };

  writeUserToDisk(users);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});