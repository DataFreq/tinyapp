const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); //extra addition
const { json } = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// const urlDatabase = { //Adding features ahead of class, commented out incase needed in upcoming assignments
//   'b2xVn2': 'https://www.lighthouselabs.ca',
//   '9sm5xK': 'https://www.google.ca'
// };

let urlDatabase = ''; //extra addition
let tempLongURL = ''; //extra addition, const template is reading before urlDatabase can be read

fs.readFile('./urlDatabase.json', 'utf8', (err, jsonString) => { //extra addition
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  urlDatabase = JSON.parse(jsonString);
});

const readDatabase = () => { //extra addition, rereads urlDatabase.json to update urlDatabase variable
  fs.readFile('./urlDatabase.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log('File read failed:', err);
      return;
    }
    urlDatabase = JSON.parse(jsonString);
  });
}

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
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };//original code, commented out for new permanent json
  const templateVars = { shortURL: req.params.shortURL, longURL: tempLongURL };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  tempLongURL = req.body.longURL;
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

const generateRandomString = () => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  for (let key in urlDatabase) {
    if (key === randomString)
      return generateRandomString();
  }
  return randomString;
};

const writeToDisk = (shortURL, longURL) => {
  fs.readFile('./urlDatabase.json', 'utf8', (err, data) => {
    if (err) {
      console.log("Error reading file:", err);
    }

    let urls = JSON.parse(data);
    urls[shortURL] = longURL;

    fs.writeFile('./urlDatabase.json', JSON.stringify(urls, null, 2), err => {
      if (err) {
        console.log('Error writing to file', err);
      }

      readDatabase();
    });
  });
};