const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user.
 *
 * @param {string} userId - The MongoDB _id of the user
 * @returns {string} Signed JWT valid for 30 days
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
