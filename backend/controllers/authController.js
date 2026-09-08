// ============================================================
// authController.js — Registration, Login, and Profile Fetch
//
// I follow the "thin route, fat controller" pattern here.
// Routes only define the HTTP verb + path; all business logic,
// validation, and DB interaction lives in this file.
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Sign JWT ──────────────────────────────────────────
// I extract token signing into a private helper so I don't
// duplicate the logic in both register and login.
const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ── Helper: Send Token Response ───────────────────────────────
// I create this helper to standardise the JSON shape returned
// after both registration and login. The frontend can rely on
// a consistent { success, token, user } envelope.
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // I strip the password from the response object even though
  // select:false already hides it in find queries — this handles
  // the case where we just created a new user document.
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse,
  });
};

// ── Controller: Register ──────────────────────────────────────
/**
 * POST /api/auth/register
 * Public route — creates a new user account.
 *
 * I perform manual validation here before hitting the DB so
 * I can return user-friendly messages rather than Mongoose
 * CastError or validation stack traces.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // I validate required fields before any DB interaction.
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // I check for duplicate email before attempting to insert
    // so I can return a clear 409 Conflict rather than a generic
    // Mongoose duplicate key error (code 11000).
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // I create the user — the pre-save hook in User.js handles
    // bcrypt hashing automatically before the document is saved.
    const user = await User.create({ name, email, password });

    // I immediately issue a token so the user is "logged in"
    // right after registering — no second login step needed.
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ── Controller: Login ─────────────────────────────────────────
/**
 * POST /api/auth/login
 * Public route — authenticates an existing user.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and password.',
      });
    }

    // I use .select('+password') here to explicitly override the
    // select:false on the password field so I can compare it.
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    // I use a single generic message for both "user not found"
    // and "wrong password" to prevent email enumeration attacks.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ── Controller: Get Current User ──────────────────────────────
/**
 * GET /api/auth/me
 * Protected route — returns the currently authenticated user.
 *
 * I use this on the frontend to rehydrate the session after
 * a page refresh by reading the stored JWT and hitting this
 * endpoint to get fresh user data.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by the protect middleware.
    // I query fresh from DB rather than sending req.user directly
    // in case the user just updated their profile.
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
