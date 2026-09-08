// ============================================================
// Portfolio.js — Mongoose Schema for Resume/Portfolio Data
//
// I am designing this schema to mirror the live-preview
// sections in builder.html exactly. Each sub-document array
// (experience, education, techStack) maps to a dynamic form
// section on the frontend. This tight coupling means zero
// transformation work on either end.
//
// I link every portfolio to its owner via a MongoDB ObjectId
// reference to the User model. This is the backbone of my
// multi-user data isolation strategy.
// ============================================================

const mongoose = require('mongoose');

// ── Sub-Schema: Experience Entry ──────────────────────────────
// I keep this as a sub-document so it gets a unique _id,
// which I use on the frontend to target "Remove" operations.
const ExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },       // "Present" is a valid string
  description: { type: String, trim: true, default: '' },
  isCurrent: { type: Boolean, default: false },
});

// ── Sub-Schema: Education Entry ───────────────────────────────
const EducationSchema = new mongoose.Schema({
  degree: { type: String, trim: true, default: '' },
  institution: { type: String, trim: true, default: '' },
  fieldOfStudy: { type: String, trim: true, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  grade: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
});

// ── Sub-Schema: Project Entry ─────────────────────────────────
const ProjectSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  techUsed: { type: [String], default: [] },
  liveUrl: { type: String, trim: true, default: '' },
  repoUrl: { type: String, trim: true, default: '' },
});

// ── Sub-Schema: Social Links ──────────────────────────────────
// I store social links as an embedded object (not an array)
// because the fields are fixed — there's no "add more" here.
const SocialSchema = new mongoose.Schema({
  github: { type: String, trim: true, default: '' },
  linkedin: { type: String, trim: true, default: '' },
  twitter: { type: String, trim: true, default: '' },
  website: { type: String, trim: true, default: '' },
});

// ── Main Portfolio Schema ─────────────────────────────────────
const PortfolioSchema = new mongoose.Schema(
  {
    // I reference User by ObjectId so I can use .populate()
    // in queries and cascade deletes cleanly in the future.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // I enforce one portfolio per user at the DB level
    },

    // ── Personal Info ────────────────────────────────────────
    fullName: { type: String, trim: true, default: '' },
    jobTitle: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    summary: { type: String, trim: true, default: '' },
    avatarUrl: { type: String, trim: true, default: '' },

    // ── Social Links ─────────────────────────────────────────
    social: { type: SocialSchema, default: () => ({}) },

    // ── Dynamic Arrays ───────────────────────────────────────
    // I use empty array defaults so the frontend can always
    // iterate over these without null-checking.
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },

    // I store tech stack as a flat string array for simplicity.
    // The builder renders each item as a pill/tag in the preview.
    techStack: { type: [String], default: [] },

    // ── Customization ────────────────────────────────────────
    // I allow a theme color so users can personalize their PDF.
    themeColor: { type: String, default: '#6c63ff' },

    // I track whether the user has made this portfolio public.
    // Future feature: shareable public URL.
    isPublic: { type: Boolean, default: false },
    publicSlug: { type: String, trim: true, sparse: true, default: null },
  },
  { timestamps: true }
);

// ── Compound Index ────────────────────────────────────────────
// I index by user so all portfolio fetch queries by owner ID
// hit the index rather than scanning the full collection.
PortfolioSchema.index({ user: 1 });

// I also index publicSlug for the future shareable link feature.
PortfolioSchema.index({ publicSlug: 1 }, { sparse: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);
