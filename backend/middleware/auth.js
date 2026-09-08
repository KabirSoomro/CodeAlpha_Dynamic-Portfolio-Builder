// ============================================================
// auth.js — JWT Authentication Middleware
//
// I am creating this middleware to act as a "guard" on any
// route that requires the user to be logged in. I extract
// the token from the Authorization header, verify it with
// jsonwebtoken, and then attach the decoded user object to
// req.user so downstream controllers can access it directly.
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Express middleware that verifies a Bearer JWT.
 *
 * I attach the verified user document to `req.user` so every
 * protected controller knows exactly which user is making
 * the request without having to query the DB again from scratch.
 */
const protect = async (req, res, next) => {
  let token;

  // I check the Authorization header for the "Bearer <token>" pattern.
  // This is the industry standard for JWT-based APIs.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token was provided at all, I reject immediately.
  // I do NOT try to fall back to cookies to keep the auth
  // strategy simple and stateless.
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please log in.',
    });
  }

  try {
    // I verify the token's signature and expiry in one step.
    // If the token is tampered with or expired, jwt.verify throws.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // I fetch the user from the DB to ensure the account still
    // exists. If an admin deletes the account, stale tokens are
    // rejected here rather than reaching the controller.
    // I use .select('-password') even though User schema has
    // select:false on password — belt-and-suspenders approach.
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // I attach the full user document to req so controllers can
    // access req.user.id, req.user.name, req.user.email, etc.
    req.user = currentUser;
    next();
  } catch (error) {
    // jwt.verify throws JsonWebTokenError for invalid signatures
    // and TokenExpiredError for expired tokens.
    const message =
      error.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid token. Authentication failed.';

    return res.status(401).json({ success: false, message });
  }
};

module.exports = { protect };
