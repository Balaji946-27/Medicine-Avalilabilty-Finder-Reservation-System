const jwt = require('jsonwebtoken');

// Create JWT token and send response with safe user info
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'medifind_default_secret_key',
    { expiresIn: '30d' }
  );

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: safeUser,
  });
};

module.exports = sendTokenResponse;
