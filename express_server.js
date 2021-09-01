const { generateRandomString, writeToDisk } = require('./tinyapp-functions');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = '';
let currentUser = '';

fs.readFile('./data/urlDatabase.json', 'utf8', (err, jsonString) => { // initial read of /data/urlDatabase.json (urls made by unsigned users)
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  urlDatabase = JSON.parse(jsonString);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => { //urls_index.ejs
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => { // urls_new.ejs
  const templateVars = {
    username: req.cookies['username'],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => { // urls_show.ejs
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username'],
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/edit', (req, res) => { // Edit button on urls_index.ejs redirects to urls_show.ejs
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = req.body.longURL;
  writeToDisk(urlDatabase, currentUser);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  writeToDisk(urlDatabase, currentUser);
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => { //setting new longURL
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  writeToDisk(urlDatabase, currentUser);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});