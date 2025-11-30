const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @returns {String} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId, 
      role: role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d' 
    }
  );
};

module.exports = generateToken;
