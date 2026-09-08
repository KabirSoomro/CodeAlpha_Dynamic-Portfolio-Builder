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

// ── Server Wakeup Overlay ──────────────────────────────────────
// Render free tier puts the server to sleep after 15 minutes of
// inactivity. The first request can take 30–60 seconds. I show a
// premium loading overlay so the user knows what's happening
// instead of seeing a confusing "Network error".

let _wakeupOverlay = null;

function _showWakeupOverlay() {
  if (_wakeupOverlay) return; // already visible

  _wakeupOverlay = document.createElement('div');
  _wakeupOverlay.id = 'server-wakeup-overlay';
  _wakeupOverlay.innerHTML = `
    <div class="wakeup-card">
      <div class="wakeup-spinner"></div>
      <h3>Server is waking up...</h3>
      <p>Free-tier servers sleep after inactivity.<br>This usually takes 15–30 seconds.</p>
      <div class="wakeup-dots"><span>.</span><span>.</span><span>.</span></div>
    </div>
  `;

  // I inject styles inline so this works on every page without
  // needing a separate CSS file or import.
  const style = document.createElement('style');
  style.id = 'wakeup-overlay-styles';
  style.textContent = `
    #server-wakeup-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(10, 10, 20, 0.85);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: wakeup-fade-in 0.3s ease;
    }
    @keyframes wakeup-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .wakeup-card {
      text-align: center;
      color: #fff;
      padding: 48px 40px;
      border-radius: 20px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 24px 80px rgba(0,0,0,0.4);
      max-width: 380px;
      width: 90%;
    }
    .wakeup-card h3 {
      font-family: 'Space Grotesk', 'Inter', sans-serif;
      font-size: 1.35rem;
      margin: 20px 0 8px;
      background: linear-gradient(135deg, #a78bfa, #818cf8, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .wakeup-card p {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.6);
      line-height: 1.6;
      margin: 0;
    }
    .wakeup-spinner {
      width: 48px; height: 48px;
      margin: 0 auto;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #818cf8;
      border-radius: 50%;
      animation: wakeup-spin 0.8s linear infinite;
    }
    @keyframes wakeup-spin {
      to { transform: rotate(360deg); }
    }
    .wakeup-dots {
      margin-top: 16px;
      font-size: 1.5rem;
      color: #818cf8;
      letter-spacing: 4px;
    }
    .wakeup-dots span {
      animation: wakeup-blink 1.4s infinite;
      opacity: 0;
    }
    .wakeup-dots span:nth-child(2) { animation-delay: 0.2s; }
    .wakeup-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes wakeup-blink {
      0%, 20% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(_wakeupOverlay);
}

function _hideWakeupOverlay() {
  if (_wakeupOverlay) {
    _wakeupOverlay.remove();
    _wakeupOverlay = null;
    const style = document.getElementById('wakeup-overlay-styles');
    if (style) style.remove();
  }
}

// ── Universal Fetch Wrapper ────────────────────────────────────
/**
 * apiFetch — wraps the native fetch() with:
 * - Automatic JSON Content-Type header
 * - Automatic Authorization: Bearer <token> header
 * - JSON response parsing
 * - Unified error object { success: false, message }
 * - Auto-retry with wakeup overlay on network failures
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

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [3000, 6000, 10000]; // increasing backoff

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // If we get here, the server responded — hide the overlay.
      _hideWakeupOverlay();

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
      console.warn(`[apiFetch] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for ${endpoint}:`, error.message);

      if (attempt < MAX_RETRIES) {
        // Show the wakeup overlay on the first retry attempt
        _showWakeupOverlay();

        // Wait before retrying with increasing delay
        await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
      } else {
        // All retries exhausted — hide overlay and return error
        _hideWakeupOverlay();
        console.error(`[apiFetch] All retries failed for ${endpoint}`);
        return {
          success: false,
          message: 'Server is taking too long to respond. Please refresh the page and try again.',
        };
      }
    }
  }
}

// I expose Auth and apiFetch globally so all script files can
// use them without ES module import syntax (for compatibility
// with plain HTML <script> tags without a bundler).
window.Auth = Auth;
window.apiFetch = apiFetch;

