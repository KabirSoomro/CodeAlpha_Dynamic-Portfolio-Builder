// ============================================================
// authRoutes.js — Authentication API Endpoints
//
// I wire the HTTP verbs and URL paths to the controller
// functions here. I deliberately keep this file lean —
// zero business logic lives in a route file.
// ============================================================

const express = require('express');
const router = express.Router();

const { register, login, getMe, forgotPassword, resetPassword, updateDetails } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register — Public
// I allow any unauthenticated request to hit this endpoint.
router.post('/register', register);

// POST /api/auth/login — Public
router.post('/login', login);

// GET /api/auth/me — Protected
// I pass `protect` as middleware before `getMe` so the route
// is guarded — unauthenticated requests are rejected before
// the controller function ever runs.
router.get('/me', protect, getMe);

// POST /api/auth/forgotpassword — Public
router.post('/forgotpassword', forgotPassword);

// PUT /api/auth/resetpassword/:resettoken — Public
router.put('/resetpassword/:resettoken', resetPassword);

// PUT /api/auth/updatedetails — Protected
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
