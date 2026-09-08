// ============================================================
// server.js — Express Application Entry Point
//
// I am treating this file as the "nerve centre" of the backend.
// It initialises the Express app, registers all global middleware,
// mounts route prefixes, and starts the HTTP listener.
//
// I deliberately keep all business logic OUT of this file.
// Controllers and routes handle that — this file is infrastructure.
// ============================================================

// ── Core Dependencies ─────────────────────────────────────────
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

// ── Internal Modules ──────────────────────────────────────────
const connectDB = require('./config/db');

// I load environment variables from .env before anything else
// so every subsequent require() can access process.env safely.
dotenv.config();

// ── Initialise Express ────────────────────────────────────────
const app = express();

// ── Connect to MongoDB Atlas ──────────────────────────────────
// I call this immediately and await implicitly — if it fails,
// db.js calls process.exit(1) and the server never starts.
connectDB(process.env.MONGO_URI);

// ── Security Middleware ───────────────────────────────────────
// I added Helmet to set secure HTTP headers automatically.
// This protects against well-known web vulnerabilities like
// XSS, clickjacking, and MIME-type sniffing with zero effort.
app.use(helmet());

// I configure CORS to allow only my Vercel frontend domain in
// production and localhost in development. This prevents
// unauthorised domains from hitting my API.
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',        // Live Server (VS Code)
  'http://localhost:5500',
  process.env.FRONTEND_URL,       // Set this to your Vercel URL in Render
].filter(Boolean);                // I filter falsy values in case FRONTEND_URL is unset

app.use(
  cors({
    origin: (origin, callback) => {
      // I allow requests with no origin (e.g., Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      // Allow any *.vercel.app subdomain (covers all preview/prod URLs)
      if (origin.endsWith('.vercel.app')) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Request Parsing Middleware ────────────────────────────────
// I limit the JSON payload to 10mb to handle base64 avatar
// uploads without rejecting legitimate requests.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP Request Logger ───────────────────────────────────────
// I use 'dev' format in development for colourised output and
// 'combined' in production for structured, parseable logs
// that Render's log dashboard can display properly.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Health Check Route ────────────────────────────────────────
// I add this so Render's health check pings a lightweight
// endpoint instead of a protected API route. This prevents
// false "service down" alerts during deployment.
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Portfolio API is live and healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── API Route Mounting ────────────────────────────────────────
// I mount all routes under /api/ so they are cleanly separated
// from any static file serving or future WebSocket endpoints.
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));

// ── 404 Handler ───────────────────────────────────────────────
// I catch any request that did not match a registered route
// and return a structured JSON response instead of the default
// Express HTML error page — this is cleaner for the frontend.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global Error Handler ──────────────────────────────────────
// I register this as the LAST middleware. Express identifies
// error-handling middleware by its 4-argument signature (err, req, res, next).
// All controllers call next(err) to funnel errors here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // I log the full stack in development for debugging ease.
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Unhandled Error:', err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // I only expose the stack trace in development builds.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start HTTP Server ─────────────────────────────────────────
// I read PORT from the environment so Render can inject its
// assigned port dynamically at runtime. Fallback to 5000 for
// local development.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🌐 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

module.exports = app; // I export for potential integration testing
