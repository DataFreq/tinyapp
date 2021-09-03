const { generateRandomString, writeUrlToDisk, writeUserToDisk, getUserByEmail, pullUserURLs, generateDate } = require('./helpers');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const app = express();
const PORT = 8080;

let users = '';
let urlDatabase = '';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['861c055276c12983c53af1b06f6afce60ef598988363e7ad9698122538fda6388627164df991eeaa0878747e8b037e373d5dd8d5c6d56371548aaaf61c73867a'],
  maxAge: 24 * 60 * 60 * 1000
}));

fs.readFile('./databases/urlDatabase.json', 'utf8', (err, jsonString) => {
  if (err)
    return res.status(500).send("Internal Server Error", err);
  // initial load of urlDatabase.json to memory
  urlDatabase = JSON.parse(jsonString);
});

fs.readFile('./databases/userDatabase.json', 'utf8', (err, jsonString) => {
  if (err)
    return res.status(500).send("Internal Server Error", err);
  // initial load of userDatabase.json to memory
  users = JSON.parse(jsonString);
});

app.get('/', (req, res) => {
  req.session.user_id ? res.redirect('/urls') : res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: pullUserURLs(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id)
    return res.redirect('/login');
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL])
    return res.status(404).send("Invalid TinyURL link.");
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id],
    owner: urlDatabase[shortURL].userID,
    created: urlDatabase[shortURL].created,
    visits: urlDatabase[shortURL].visits,
    uVisits: urlDatabase[shortURL].uVisits
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL])
    return res.status(404).send("Invalid URL");
  const baseURL = urlDatabase[req.params.shortURL];
  const longURL = baseURL.longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  if (req.session.user_id)
    return res.redirect('/urls');
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.user_id)
    return res.redirect('/urls');
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('urls_login', templateVars);
});

/* <-------------------- end of GET -------------------- > */

// Adds new url to database, redirects back to /urls if successful.
app.post('/urls', (req, res) => {
  if (!users[req.session.user_id])
    return res.status(403).send("Only registered accounts may create URLs");
  const shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    created: generateDate(),
    visits: [],
    uVisits: []
  };
  writeUrlToDisk(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// If user has correct permissions, removes url from local urlDatabase and updates persistent file.
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id !== urlDatabase[shortURL].userID)
    return res.status(403).send(`Only the owner of ${shortURL} may delete this shortURL.`);
  delete urlDatabase[shortURL];
  writeUrlToDisk(urlDatabase);
  res.redirect('/urls');
});

// If user has correct permissions, updates longUrl from local urlDatabase and updates persistent file.
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  if (req.session.user_id !== urlDatabase[shortURL].userID)
    return res.status(403).send(`You do not have permission to edit ${shortURL}.`);
  urlDatabase[shortURL].longURL = req.body.newURL;
  writeUrlToDisk(urlDatabase);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = getUserByEmail(email, users);
  if (!id)
    return res.status(403).send("Account not found");
  if (bcrypt.compareSync(password, users[id].password)) {
    req.session.user_id = id;
    return res.redirect('/urls');
  }
  return res.status(403).send("Incorrect Password");
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString(users);
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password)
    return res.status(404).send("Invalid email or password.");
  if (getUserByEmail(email, users))
    return res.status(404).send("An account with that email already exists.");
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id: id,
    email: email,
    password : hashedPassword
  };
  writeUserToDisk(users);
  req.session.user_id =  id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});