const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const sendTokenResponse = require('../utils/sendTokenResponse');

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Required fields validation
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    // 2. Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // 3. Password length
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long', 400));
    }

    // 4. Role restriction — Admin registration is strictly forbidden via public API
    const userRole = role ? role.toLowerCase() : 'patient';
    if (userRole === 'admin') {
      return next(
        new AppError('Direct registration as admin is not allowed', 400)
      );
    }

    if (!['patient', 'pharmacy'].includes(userRole)) {
      return next(new AppError('Invalid role selected', 400));
    }

    // 5. Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email address is already registered', 409));
    }

    // 6. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate request
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2. Find user & select password field explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // 3. Check if account is blocked
    if (user.isBlocked) {
      return next(
        new AppError('Your account has been blocked. Contact administrator.', 403)
      );
    }

    // 4. Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
