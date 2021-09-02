const fs = require('fs');

//creates 6 character alphanumeric string
const generateRandomString = data => {
  const randomString = (Math.random() + 1).toString(36).substring(6);
  if (randomString.length !== 6)
    return generateRandomString(data);
  for (let key in data) {
    //checks top most key for duplicate tag
    if (key === randomString)
      return generateRandomString(data);
    //when checking urls, also checks if existing tag is being used as an id
    if (data[key].userID) {
      if (randomString === data[key].userID)
        return generateRandomString(data);
    }
  }
  return randomString;
};

//writes urlDatabase variable to persistent file
const writeUrlToDisk = data => {
  const file = "./databases/urlDatabase.json";
  fs.writeFile(file, JSON.stringify(data, null, 2), err => {
    if (err)
      console.log('Error writing to file', err);
  });
};

//writes users variable to a persistent file
const writeUserToDisk = data => {
  const file = "./databases/userDatabase.json";
  fs.writeFile(file, JSON.stringify(data, null, 2), err => {
    if (err)
      console.log('Error writing to file', err);
  });
};

//searches userDatabase for email, returns userID if true
const getUserByEmail = (email, users) => {
  for (let key in users) {
    if (email === users[key].email)
      //user id is returned to be used in cookie
      return key;
  }
  return false;
};

//grabs all urls that match user ID
const pullUserURLs = (user, data) => {
  let userURLs = {};
  for (let key in data) {
    if (user === data[key].userID)
      userURLs[key] = data[key];
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  writeUrlToDisk,
  writeUserToDisk,
  getUserByEmail,
  pullUserURLs,
};