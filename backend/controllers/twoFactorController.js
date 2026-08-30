const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

// @desc    Generate 2FA Secret & QR Code
// @route   POST /api/2fa/generate
// @access  Authenticated
const generateTwoFactorSecret = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const secret = speakeasy.generateSecret({
      name: `CampusLedger (${user.email})`,
      issuer: 'CampusLedger',
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify 2FA Token
// @route   POST /api/2fa/verify
// @access  Authenticated
const verifyTwoFactorToken = async (req, res) => {
  try {
    const { token, secret } = req.body;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (verified) {
      res.json({
        success: true,
        message: 'Two-Factor Authentication token verified successfully!',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid 6-digit code. Please check your authenticator app.',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
};
