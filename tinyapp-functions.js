const fs = require('fs');

const generateRandomString = urlDatabase => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  for (let key in urlDatabase) {
    if (key === randomString)
      return generateRandomString();
  }
  return randomString;
};

const writeToDisk = (urlDatabase) => {
  fs.writeFile('./data/urlDatabase.json', JSON.stringify(urlDatabase, null, 2), err => {
    if (err) {
      console.log('Error writing to file', err);
    }
  });
};

module.exports = {
  generateRandomString,
  writeToDisk,
};