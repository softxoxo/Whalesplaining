const crypto = require('crypto');

function generateUniqueSessionId() {
  // Generate a random bytes buffer
  const buffer = crypto.randomBytes(16);

  // Convert the buffer to a hexadecimal string
  const sessionId = buffer.toString('hex');

  return sessionId;
}

module.exports = {
  generateUniqueSessionId,
};