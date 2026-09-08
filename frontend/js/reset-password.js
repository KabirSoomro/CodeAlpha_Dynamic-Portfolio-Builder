document.addEventListener('DOMContentLoaded', () => {
  const resetForm = document.getElementById('reset-form');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const resetMsg = document.getElementById('reset-message');
  const resetBtn = document.getElementById('reset-btn');

  // Extract the token from the URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    showMessage(resetMsg, 'Invalid or missing reset token. Please request a new link.');
    newPasswordInput.disabled = true;
    confirmPasswordInput.disabled = true;
    resetBtn.disabled = true;
    return;
  }

  function showMessage(el, text, type = 'error') {
    el.textContent = text;
    el.className = `form-message ${type}`;
  }

  function setLoading(btn, isLoading) {
    btn.classList.toggle('loading', isLoading);
    btn.disabled = isLoading;
  }

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password.length < 6) {
      return showMessage(resetMsg, 'Password must be at least 6 characters.');
    }

    if (password !== confirmPassword) {
      return showMessage(resetMsg, 'Passwords do not match.');
    }

    setLoading(resetBtn, true);
    resetMsg.textContent = '';

    const data = await apiFetch(`/auth/resetpassword/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });

    setLoading(resetBtn, false);

    if (data?.success) {
      // API sends back the token so we can automatically log them in
      if (window.Auth && data.token && data.user) {
        window.Auth.setToken(data.token);
        window.Auth.setUser(data.user);
      } else {
        // Fallback if Auth is not available globally here
        localStorage.setItem('portfolio_token', data.token);
        localStorage.setItem('portfolio_user', JSON.stringify(data.user));
      }
      
      showMessage(resetMsg, '✅ Password reset successful! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
    } else {
      showMessage(resetMsg, data?.message || 'Password reset failed. The link may have expired.');
    }
  });
});
