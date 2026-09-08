/* ============================================================
   auth.js — Registration, Login, Tab Switching, Password Strength
   
   This script runs only on index.html. I keep it completely
   separate from dashboard and builder logic so there are zero
   circular dependencies between the three pages.
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Guard: Redirect If Already Logged In ─────────────────────
  // I check this first so logged-in users never see the auth page.
  Auth.redirectIfLoggedIn();

  // ── DOM References ────────────────────────────────────────────
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');
  const panelLogin   = document.getElementById('panel-login');
  const panelRegister= document.getElementById('panel-register');
  const tabsWrapper  = document.querySelector('.auth-tabs');

  const loginForm    = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const loginMsg     = document.getElementById('login-message');
  const registerMsg  = document.getElementById('register-message');

  const loginBtn     = document.getElementById('login-btn');
  const registerBtn  = document.getElementById('register-btn');

  const regPassword  = document.getElementById('reg-password');
  const strengthFill = document.getElementById('strength-fill');
  const strengthLabel= document.getElementById('strength-label');

  // ── Tab Switching ─────────────────────────────────────────────
  // I use a data attribute on the wrapper to drive the CSS
  // sliding indicator instead of manually moving a DOM element.
  function switchTab(activeTab) {
    const isLogin = activeTab === 'login';

    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    tabLogin.setAttribute('aria-selected', isLogin);
    tabRegister.setAttribute('aria-selected', !isLogin);

    panelLogin.classList.toggle('active', isLogin);
    panelRegister.classList.toggle('active', !isLogin);

    // I update the wrapper data attribute — CSS uses it to move
    // the sliding indicator pill left or right.
    tabsWrapper.dataset.active = activeTab;

    // I clear any stale messages when switching tabs
    loginMsg.textContent = '';
    loginMsg.className = 'form-message';
    registerMsg.textContent = '';
    registerMsg.className = 'form-message';
  }

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));

  // ── Password Visibility Toggle ────────────────────────────────
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? '🙈' : '👁';
    });
  });

  // ── Password Strength Meter ───────────────────────────────────
  // I evaluate strength in real-time on every keystroke so the
  // user gets immediate visual feedback before submitting.
  const strengthRules = [
    { regex: /.{8,}/,          label: 'Fair',   level: 'fair'   },
    { regex: /[A-Z]/,          label: 'Good',   level: 'good'   },
    { regex: /[0-9]/,          label: 'Good',   level: 'good'   },
    { regex: /[^A-Za-z0-9]/,  label: 'Strong', level: 'strong' },
  ];

  regPassword.addEventListener('input', () => {
    const val = regPassword.value;

    if (!val) {
      strengthFill.removeAttribute('data-strength');
      strengthFill.style.width = '0%';
      strengthLabel.textContent = 'Enter a password';
      return;
    }

    let score = 0;
    strengthRules.forEach((rule) => {
      if (rule.regex.test(val)) score++;
    });

    const levels = ['weak', 'fair', 'good', 'strong'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong! 🔐'];
    const idx = Math.min(score, 3);

    strengthFill.dataset.strength = levels[idx];
    strengthLabel.textContent = labels[idx];
  });

  // ── Utility: Show Message ─────────────────────────────────────
  function showMessage(el, text, type = 'error') {
    el.textContent = text;
    el.className = `form-message ${type}`;
  }

  // ── Utility: Set Button Loading ───────────────────────────────
  function setLoading(btn, isLoading) {
    btn.classList.toggle('loading', isLoading);
    btn.disabled = isLoading;
  }

  // ── Login Form Handler ────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      return showMessage(loginMsg, 'Please fill in all fields.');
    }

    setLoading(loginBtn, true);
    loginMsg.textContent = '';

    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(loginBtn, false);

    if (data?.success) {
      // I save the token and user then redirect to the dashboard.
      Auth.setToken(data.token);
      Auth.setUser(data.user);
      showMessage(loginMsg, '✅ Login successful! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } else {
      showMessage(loginMsg, data?.message || 'Login failed. Please try again.');
    }
  });

  // ── Register Form Handler ─────────────────────────────────────
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!name || !email || !password) {
      return showMessage(registerMsg, 'Please fill in all fields.');
    }

    if (password.length < 6) {
      return showMessage(registerMsg, 'Password must be at least 6 characters.');
    }

    setLoading(registerBtn, true);
    registerMsg.textContent = '';

    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(registerBtn, false);

    if (data?.success) {
      Auth.setToken(data.token);
      Auth.setUser(data.user);
      showMessage(registerMsg, '🎉 Account created! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } else {
      showMessage(registerMsg, data?.message || 'Registration failed.');
    }
  });

}); // end DOMContentLoaded
