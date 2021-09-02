const { generateRandomString, getUserByEmail } = require('../helpers.js');
const { assert } = require('chai');

const testUsers = {
  "0x000": {
    id:"0x000",
    email: "null@null.null",
    password: "null"
  },
  "0x015": {
    id: "0x015",
    email: "twenty-one@21.io",
    password: "tw3n7y0n3!"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("null@null.com", testUsers);
    const expectedOutput = "0x000";
    assert.equal(user, expectedOutput);
  });
  it('should return false when passing in a user not in db', () => {
    const user = getUserByEmail("missingno@pkmn.co", testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
  it('should generate a random string exactly 6 characters long and not match any existing IDs', () => {
    const userID = generateRandomString(testUsers);
    assert.isTrue(userID !== testUsers[userID] && userID.length === 6);
  });
});