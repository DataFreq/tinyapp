const fs = require('fs');

// VV Commented out probably not needed
// const readDatabase = () => { //rereads urlDatabase.json to update urlDatabase variable
//   fs.readFile('./data/urlDatabase.json', 'utf8', (err, jsonString) => {
//     if (err) {
//       console.log('File read failed:', err);
//       return;
//     }
//     urlDatabase = JSON.parse(jsonString);
//     return JSON.parse(jsonString);
//   });
// };

const generateRandomString = urlDatabase => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  for (let key in urlDatabase) {
    if (key === randomString)
      return generateRandomString();
  }
  return randomString;
};

const writeToDisk = (shortURL, longURL) => {
  fs.readFile('./data/urlDatabase.json', 'utf8', (err, data) => {
    if (err) {
      console.log("Error reading file:", err);
    }

    let urls = JSON.parse(data);
    urls[shortURL] = longURL;

    fs.writeFile('./data/urlDatabase.json', JSON.stringify(urls, null, 2), err => {
      if (err) {
        console.log('Error writing to file', err);
      }
    });
  });
};

module.exports = {
  generateRandomString,
  writeToDisk,
};