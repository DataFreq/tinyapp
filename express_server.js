const { generateRandomString, writeUrlToDisk, writeUserToDisk, activeAccount, pullUserURLs } = require('./tinyapp-functions');
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

fs.readFile('./data/urlDatabase.json', 'utf8', (err, jsonString) => { // initial load of urlDatabase.json
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  urlDatabase = JSON.parse(jsonString);
});

fs.readFile('./data/userDatabase.json', 'utf8', (err, jsonString) => { // initial load of userDatabase.json
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
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }

  const templateVars = {
    urls: pullUserURLs(req.cookies['user_id'], urlDatabase),
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
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID)
    return res.status(403).send(`Only the owner of the ${shortURL} may edit this shortURL.`);
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_login', templateVars);
});

/* <-------------------- end of GET -------------------- > */

app.post('/urls/:shortURL/edit', (req, res) => { // Edit button on urls_index.ejs redirects to urls_show.ejs
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls', (req, res) => {
  if (!users[req.cookies['user_id']])
    return res.status(403).send("Only registered accounts may create URLs");
  let shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  writeUrlToDisk(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!users[req.cookies['user_id']])
    return res.status(403).send(`Only the owner of ${shortURL} may delete this shortURL.`);

  delete urlDatabase[shortURL];
  writeUrlToDisk(urlDatabase);
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => { //edit url
  const shortURL = req.params.id;

  if (!users[req.cookies['user_id']])
    return res.status(403).send(`Only the owner of ${shortURL} may edit this shortURL.`);
    
  urlDatabase[shortURL].longURL = req.body.newURL;
  writeUrlToDisk(urlDatabase);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = activeAccount(email, users);

  if (!id)
    return res.status(403).send("Account not found");

  if (password !== users[id].password)
    return res.status(403).send("Incorrect Password");
  
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
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