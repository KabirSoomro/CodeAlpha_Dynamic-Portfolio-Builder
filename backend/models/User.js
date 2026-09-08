// ============================================================
// User.js — Mongoose Schema for Authentication
//
// I am defining the User model here with strict validation.
// I store only what is necessary for auth and profile ownership.
// The password field is never returned in API responses —
// I enforce that with the `select: false` directive.
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// I am defining the schema with timestamps:true so Mongoose
// automatically adds createdAt and updatedAt fields for me.
// This is useful for auditing and future analytics.
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      // I am using a lightweight regex here instead of a heavy
      // validation library to keep the bundle small.
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      // I set select:false so the password hash is NEVER sent
      // back in any query result unless explicitly requested.
      select: false,
    },

    // I store the avatar as a URL string so users can link
    // a Gravatar or an uploaded image. Default is a placeholder.
    avatar: {
      type: String,
      default: '',
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// ── Pre-save Hook ──────────────────────────────────────────────
// I am using a pre-save hook instead of hashing in the controller
// so the logic is co-located with the model and cannot be
// accidentally bypassed by any other code path.
UserSchema.pre('save', async function (next) {
  // I only re-hash if the password field was actually modified.
  // This prevents double-hashing on unrelated profile updates.
  if (!this.isModified('password')) return next();

  // Salt rounds = 12 gives a strong hash with acceptable CPU cost.
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: comparePassword ──────────────────────────
// I expose a clean method on the model instance so controllers
// can verify a login attempt without importing bcrypt themselves.
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: getResetPasswordToken ────────────────────
// Generates a token, hashes it, and stores it in the database.
UserSchema.methods.getResetPasswordToken = function () {
  // Generate random 20 byte token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set it to resetPasswordToken field
  // Using sha256 because it is fast and secure for single-use tokens
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration to 10 minutes from now
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // Return the original un-hashed token to send to the user's email
  return resetToken;
};

// ── Index ──────────────────────────────────────────────────────
// I add an index on email because every login query filters by it.
// Atlas will use this index to avoid a full collection scan.
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
