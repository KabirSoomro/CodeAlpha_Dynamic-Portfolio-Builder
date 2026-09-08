// ============================================================
// portfolioController.js — Full CRUD for Portfolio Data
//
// I structure these controllers around the "upsert" strategy:
// instead of separate "create" and "update" endpoints, I use
// MongoDB's findOneAndUpdate with { upsert: true } so the
// frontend only needs to call one endpoint for both cases.
//
// All routes are protected by the `protect` middleware, so
// req.user.id is guaranteed to be the authenticated user's ID.
// This ensures strict data isolation — users can only ever
// touch their own portfolio document.
// ============================================================

const Portfolio = require('../models/Portfolio');

// ── Controller: Get My Portfolio ──────────────────────────────
/**
 * GET /api/portfolio/me
 * Protected — fetches the authenticated user's portfolio.
 *
 * If the user has not yet created a portfolio, I return an
 * empty object with success:true instead of a 404 so the
 * frontend builder can distinguish between "no data" and
 * "network error".
 */
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });

    if (!portfolio) {
      // I return an empty portfolio shape so the frontend doesn't
      // have to null-check every field before rendering the form.
      return res.status(200).json({
        success: true,
        portfolio: null,
        message: 'No portfolio found. Start building one!',
      });
    }

    res.status(200).json({ success: true, portfolio });
  } catch (error) {
    next(error);
  }
};

// ── Controller: Upsert Portfolio (Create or Full Update) ──────
/**
 * POST /api/portfolio
 * Protected — creates the portfolio if it doesn't exist,
 * or fully replaces it if it does.
 *
 * I use the upsert pattern here because the frontend's
 * auto-save should always "just work" regardless of whether
 * the user has saved before. The user doesn't need to think
 * about "create vs update" — that complexity lives here.
 */
const upsertPortfolio = async (req, res, next) => {
  try {
    // I spread the request body and attach the authenticated user's
    // ID. This prevents a malicious user from submitting a
    // different user ID in the request body to overwrite someone
    // else's portfolio.
    const portfolioData = { ...req.body, user: req.user.id };

    // findOneAndUpdate with upsert:true creates the document if
    // it doesn't exist, or updates it if it does.
    // new:true returns the updated document rather than the old one.
    // runValidators:true ensures Mongoose schema validators run on update.
    const portfolio = await Portfolio.findOneAndUpdate(
      { user: req.user.id },
      portfolioData,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Portfolio saved successfully.',
      portfolio,
    });
  } catch (error) {
    next(error);
  }
};

// ── Controller: Partial Update (Patch) ───────────────────────
/**
 * PATCH /api/portfolio
 * Protected — partially updates specific fields.
 *
 * I use $set so that only the fields included in the request
 * body are updated. This is critical for the auto-save feature:
 * when a user edits only the "summary" field, I don't want to
 * overwrite their experience array with an undefined value.
 */
const patchPortfolio = async (req, res, next) => {
  try {
    // I remove the user field from req.body to prevent privilege
    // escalation — the user reference is always taken from the JWT.
    const { user: _ignored, ...updateData } = req.body;

    const portfolio = await Portfolio.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Portfolio updated.',
      portfolio,
    });
  } catch (error) {
    next(error);
  }
};

// ── Controller: Delete Portfolio ──────────────────────────────
/**
 * DELETE /api/portfolio
 * Protected — permanently deletes the user's portfolio.
 *
 * I do NOT cascade-delete the User account here — this only
 * removes the portfolio document. The user can rebuild from scratch.
 */
const deletePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ user: req.user.id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'No portfolio found to delete.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio,
  upsertPortfolio,
  patchPortfolio,
  deletePortfolio,
};
