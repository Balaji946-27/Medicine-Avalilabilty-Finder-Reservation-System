const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// ─── Protect routes: Verify JWT & attach req.user ────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'medifind_default_secret_key'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new AppError('User belonging to token no longer exists', 401));
      }

      if (user.isBlocked) {
        return next(
          new AppError('Your account has been blocked. Contact administrator.', 403)
        );
      }

      req.user = user;
      next();
    } catch (err) {
      return next(new AppError('Not authorized, token failed', 401));
    }
  } catch (error) {
    next(error);
  }
};

// ─── Authorize roles: Enforce role-based access ──────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
