// ============================================================
// authController.js — Registration, Login, and Profile Fetch
//
// I follow the "thin route, fat controller" pattern here.
// Routes only define the HTTP verb + path; all business logic,
// validation, and DB interaction lives in this file.
// ============================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

// ── Controller: Forgot Password ───────────────────────────────
/**
 * POST /api/auth/forgotpassword
 * @desc Generate and send a password reset token to user email
 */
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // For security, do not reveal if the email exists or not
      return res.status(200).json({ success: true, message: 'If an account exists, an email has been sent.' });
    }

    // Get reset token (this modifies the user object but doesn't save yet)
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL (pointing to the frontend reset-password.html page)
    // Use the FRONTEND_URL from env, default to local if not set
    const frontendURL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
    const resetUrl = `${frontendURL}/reset-password.html?token=${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your CodeAlpha Portfolio Builder account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you did not request this, please ignore this email. This link will expire in 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// ── Controller: Reset Password ────────────────────────────────
/**
 * PUT /api/auth/resetpassword/:resettoken
 * @desc Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send token response to automatically log them in
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ── Controller: Update User Details ────────────────────────────
/**
 * PUT /api/auth/updatedetails
 * Protected route — updates user name, email, and avatar.
 */
const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email.toLowerCase();
    if (req.body.avatar) fieldsToUpdate.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

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
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }
    next(error);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateDetails };
