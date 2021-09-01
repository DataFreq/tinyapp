const fs = require('fs');

const generateRandomString = urlDatabase => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  for (let key in urlDatabase) {
    if (key === randomString)
      return generateRandomString();
  }
  return randomString;
};

const writeUrlToDisk = (data, currentUser) => {
  let file = "./data/urlDatabase.json";
  if (currentUser !== '') {
    file = `./data/${currentUser}.json`;
  }
  fs.writeFile(file, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.log('Error writing to file', err);
    }
  });
};

const writeUserToDisk = data => {
  let file = "./data/userDatabase.json";
  fs.writeFile(file, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.log('Error writing to file', err);
    }
  });
};

module.exports = {
  generateRandomString,
  writeUrlToDisk,
  writeUserToDisk,
};