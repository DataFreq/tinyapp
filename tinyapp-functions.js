const fs = require('fs');

const generateRandomString = data => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  for (let key in data) {
    if (key === data)
      return generateRandomString();
  }
  return randomString;
};

const writeUrlToDisk = data => {
  let file = "./databases/urlDatabase.json";
  fs.writeFile(file, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.log('Error writing to file', err);
    }
  });
};

const writeUserToDisk = data => {
  let file = "./databases/userDatabase.json";
  fs.writeFile(file, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.log('Error writing to file', err);
    }
  });
};

const activeAccount = (email, users) => {
  for (let key in users) {
    if (email === users[key].email)
      return key;
  }
  return false;
};

const pullUserURLs = (user, data) => {//originally named "urlsForUser"
  let userURLs = {};

  for (let key in data) {
    if (user === data[key].userID) {
      userURLs[key] = data[key];
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  writeUrlToDisk,
  writeUserToDisk,
  activeAccount,
  pullUserURLs,
};