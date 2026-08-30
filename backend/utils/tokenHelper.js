const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'campusledger_super_secret_jwt_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const getResetPasswordToken = () => {
  // Generate random token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Expire in 10 minutes
  const expires = Date.now() + 10 * 60 * 1000;

  return { resetToken, hashedToken, expires };
};

module.exports = { generateToken, getResetPasswordToken };
