// ============================================================
// portfolioRoutes.js — Portfolio CRUD API Endpoints
//
// I apply the `protect` middleware to EVERY route in this
// file. There is no such thing as a public portfolio write
// operation — all reads and writes are scoped to the
// authenticated user's ObjectId.
// ============================================================

const express = require('express');
const router = express.Router();

const {
  getPortfolio,
  upsertPortfolio,
  patchPortfolio,
  deletePortfolio,
} = require('../controllers/portfolioController');

const { protect } = require('../middleware/auth');

// I apply protect at the router level so it runs before
// every single route handler in this file automatically.
router.use(protect);

// GET  /api/portfolio/me    — Fetch authenticated user's portfolio
router.get('/me', getPortfolio);

// POST /api/portfolio       — Create OR fully replace portfolio (upsert)
router.post('/', upsertPortfolio);

// PATCH /api/portfolio      — Partial update (used by auto-save)
// I use PATCH specifically for the debounced auto-save calls
// because PATCH semantics mean "update only what I send",
// which is exactly what selective field saves require.
router.patch('/', patchPortfolio);

// PUT /api/portfolio        — Full replace (alias for upsert from frontend)
router.put('/', upsertPortfolio);

// DELETE /api/portfolio     — Permanently delete portfolio
router.delete('/', deletePortfolio);

module.exports = router;
