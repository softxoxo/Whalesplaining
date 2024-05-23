const crypto = require('crypto');

function generateUniqueSessionId() {
  // Generate a random bytes buffer
  const buffer = crypto.randomBytes(16);

  // Convert the buffer to a hexadecimal string
  const sessionId = buffer.toString('hex');

  return sessionId;
}

function retrievePreviousUsers(userData) {
  const previousUsers = [];

  for (const userIdStr in userData) {
    const userId = parseInt(userIdStr, 10);
    previousUsers.push(userId);
  }

  console.log("Previous users:", previousUsers);
  return previousUsers;
}

module.exports = {
  generateUniqueSessionId,
  retrievePreviousUsers,
};