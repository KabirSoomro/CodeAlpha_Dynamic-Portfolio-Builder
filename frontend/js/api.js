/* ============================================================
   api.js — Centralised API Service Layer
   
   I create this module first because every other JS file in
   the frontend depends on it. It acts as the single source of
   truth for:
   - The backend base URL (change once, affects all files)
   - Token storage and retrieval from localStorage
   - A universal `apiFetch` wrapper with auth headers, JSON
     parsing, and standardised error handling
   
   I am NOT using a framework — this is pure ES6 Vanilla JS.
============================================================ */

// ── Configuration ─────────────────────────────────────────────
// I read the backend URL from a constant here so I only need
// to change it in one place when deploying to Render.
const API_BASE_URL = 'https://codealpha-dynamic-portfolio-builder.onrender.com/api';

// ── Token Helpers ──────────────────────────────────────────────
// I store the JWT in localStorage so it survives page refreshes.
// On logout, I remove it so protected routes reject stale tokens.

const Auth = {
  /**
   * I save the token after a successful login or register.
   * @param {string} token
   */
  setToken(token) {
    localStorage.setItem('portfolio_token', token);
  },

  /**
   * I retrieve the stored token for use in Authorization headers.
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('portfolio_token');
  },

  /**
   * I save the user object so the dashboard can display the user's
   * name without hitting /api/auth/me on every load.
   * @param {Object} user
   */
  setUser(user) {
    localStorage.setItem('portfolio_user', JSON.stringify(user));
  },

  /**
   * @returns {Object|null}
   */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('portfolio_user'));
    } catch {
      return null;
    }
  },

  /** I clear all auth data on logout. */
  clear() {
    localStorage.removeItem('portfolio_token');
    localStorage.removeItem('portfolio_user');
    // I also remove the legacy 'user' key in case it was set by
    // an older version of settings.js to prevent stale avatar data.
    localStorage.removeItem('user');
  },

  /** I check whether the user appears to be logged in. */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * I redirect to the login page if the user is not authenticated.
   * I call this at the top of protected pages (dashboard, builder).
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
    }
  },

  /**
   * I redirect to dashboard if the user is already logged in.
   * I call this on index.html so logged-in users skip the auth page.
   */
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = 'dashboard.html';
    }
  },
};

// ── Universal Fetch Wrapper ────────────────────────────────────
/**
 * apiFetch — wraps the native fetch() with:
 * - Automatic JSON Content-Type header
 * - Automatic Authorization: Bearer <token> header
 * - JSON response parsing
 * - Unified error object { success: false, message }
 *
 * @param {string} endpoint — e.g. '/auth/login'
 * @param {RequestInit} options — standard fetch options
 * @returns {Promise<Object>} — parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();

  // I build headers fresh on every call so token updates are
  // reflected immediately without needing a page reload.
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // I parse the body regardless of status code so I can read
    // the error message returned by the backend.
    const data = await response.json();

    // If the backend returns 401 from a protected route, the
    // token is invalid or expired. I clear auth and redirect.
    // I only redirect if the endpoint is not login/register, 
    // otherwise the login page itself would refresh on a wrong password!
    if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      Auth.clear();
      window.location.href = 'index.html';
      return;
    }

    return data;
  } catch (error) {
    // Network error or JSON parse failure
    console.error(`[apiFetch] Network error on ${endpoint}:`, error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

// I expose Auth and apiFetch globally so all script files can
// use them without ES module import syntax (for compatibility
// with plain HTML <script> tags without a bundler).
window.Auth = Auth;
window.apiFetch = apiFetch;
