const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { generateRandomString, writeToDisk } = require('./tinyapp-functions');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// const urlDatabase = { //Adding features ahead of class, commented out incase needed in upcoming assignments
//   'b2xVn2': 'https://www.lighthouselabs.ca',
//   '9sm5xK': 'https://www.google.ca'
// };

let urlDatabase = '';

fs.readFile('./data/urlDatabase.json', 'utf8', (err, jsonString) => { // initial read of /data/urlDatabase.json
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  urlDatabase = JSON.parse(jsonString);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = req.body.longURL;
  writeToDisk(shortURL, req.body.longURL);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});