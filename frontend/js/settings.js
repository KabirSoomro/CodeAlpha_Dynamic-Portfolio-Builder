/* ============================================================
   settings.js — Dashboard Profile Settings & Security
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');
  
  const nameInput = document.getElementById('settings-name');
  const emailInput = document.getElementById('settings-email');
  const avatarUpload = document.getElementById('avatar-upload');
  const removeAvatarBtn = document.getElementById('remove-avatar-btn');
  const avatarPreview = document.getElementById('settings-avatar-preview');
  const avatarPlaceholder = document.getElementById('settings-avatar-placeholder');
  const messageDiv = document.getElementById('settings-message');

  const navAvatar = document.getElementById('nav-avatar');
  const navName = document.getElementById('user-name-nav');

  let currentAvatarBase64 = null;

  // ── Modal Open / Close Helpers ────────────────────────────────
  function openModal() {
    const user = Auth.getUser();
    if (user) {
      nameInput.value = user.name || '';
      emailInput.value = user.email || '';
      
      if (user.avatar) {
        currentAvatarBase64 = user.avatar;
        avatarPreview.src = user.avatar;
        avatarPreview.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
      } else {
        currentAvatarBase64 = '';
        avatarPreview.style.display = 'none';
        avatarPreview.src = '';
        avatarPlaceholder.style.display = 'flex';
      }
    }
    settingsModal.hidden = false;
    settingsModal.classList.add('active');
    settingsModal.setAttribute('aria-hidden', 'false');
    if (messageDiv) {
      messageDiv.textContent = '';
      messageDiv.className = 'form-message';
    }
    if (passwordMessageDiv) {
      passwordMessageDiv.textContent = '';
      passwordMessageDiv.className = 'form-message';
    }
  }

  function closeModal() {
    settingsModal.classList.remove('active');
    settingsModal.setAttribute('aria-hidden', 'true');
    settingsModal.hidden = true;
  }

  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', openModal);
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeModal);
  }

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeModal();
    }
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (!settingsModal.hidden || settingsModal.classList.contains('active'))) {
      closeModal();
    }
  });

  // ── Handle Avatar File Selection ──────────────────────────────
  if (avatarUpload) {
    avatarUpload.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        // Validate size (max 2MB to keep payload reasonable)
        if (file.size > 2 * 1024 * 1024) {
          showMessage('Image size should be less than 2MB', 'error');
          this.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
          currentAvatarBase64 = e.target.result;
          avatarPreview.src = currentAvatarBase64;
          avatarPreview.style.display = 'block';
          avatarPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ── Handle Remove Avatar ──────────────────────────────────────
  if (removeAvatarBtn) {
    removeAvatarBtn.addEventListener('click', () => {
      currentAvatarBase64 = ''; // Send empty string so backend removes avatar from DB
      if (avatarUpload) avatarUpload.value = '';
      if (avatarPreview) {
        avatarPreview.style.display = 'none';
        avatarPreview.src = '';
      }
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'flex';
      }
    });
  }

  // ── Handle Profile Form Submission ────────────────────────────
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!Auth.isLoggedIn()) {
        showMessage('You are not logged in.', 'error');
        return;
      }

      const submitBtn = settingsForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        const data = await apiFetch('/auth/updatedetails', {
          method: 'PUT',
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            avatar: currentAvatarBase64 !== null ? currentAvatarBase64 : ''
          })
        });

        if (data.success) {
          showMessage('Profile updated successfully!', 'success');
          
          // Update local storage
          Auth.setUser(data.user);
          
          // Update UI in Navbar
          if (navName) navName.textContent = data.user.name;
          if (navAvatar) {
            if (data.user.avatar) {
              navAvatar.src = data.user.avatar;
              navAvatar.style.display = 'block';
            } else {
              navAvatar.style.display = 'none';
              navAvatar.src = '';
            }
          }
          
          // Automatically close modal after brief confirmation
          setTimeout(() => {
            closeModal();
          }, 1200);
        } else {
          showMessage(data.message || 'Update failed', 'error');
        }
      } catch (err) {
        console.error('Update details error:', err);
        showMessage('Server error. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Set initial UI state for avatar in navbar if exists
  const storedUser = Auth.getUser();
  if (storedUser && navAvatar) {
    if (storedUser.avatar) {
      navAvatar.src = storedUser.avatar;
      navAvatar.style.display = 'block';
    } else {
      navAvatar.style.display = 'none';
      navAvatar.src = '';
    }
  }

  // ── Handle Password Update Submission ─────────────────────────
  const passwordForm = document.getElementById('password-form');
  const passwordMessageDiv = document.getElementById('password-message');

  function showPasswordMessage(text, type) {
    if (!passwordMessageDiv) return;
    passwordMessageDiv.textContent = text;
    passwordMessageDiv.className = `form-message ${type}`;
    if (type === 'error') {
      passwordMessageDiv.style.color = 'var(--color-danger)';
    } else {
      passwordMessageDiv.style.color = 'var(--color-success)';
    }
    passwordMessageDiv.style.marginTop = '12px';
    passwordMessageDiv.style.textAlign = 'center';
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!Auth.isLoggedIn()) {
        showPasswordMessage('You are not logged in.', 'error');
        return;
      }

      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (newPassword !== confirmPassword) {
        showPasswordMessage('New passwords do not match.', 'error');
        return;
      }

      if (newPassword.length < 6) {
        showPasswordMessage('New password must be at least 6 characters.', 'error');
        return;
      }

      const submitBtn = passwordForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Updating...';
      submitBtn.disabled = true;
      passwordMessageDiv.textContent = '';

      try {
        const data = await apiFetch('/auth/updatepassword', {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });

        if (data.success) {
          showPasswordMessage('Password updated successfully!', 'success');
          
          // Update stored token & user state if returned
          if (data.token) {
            Auth.setToken(data.token);
          }
          if (data.user) {
            Auth.setUser(data.user);
          }

          passwordForm.reset();
        } else {
          showPasswordMessage(data.message || 'Failed to update password', 'error');
        }
      } catch (err) {
        console.error('Update password error:', err);
        showPasswordMessage('Server error. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  function showMessage(text, type) {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `form-message ${type}`;
    if (type === 'error') {
      messageDiv.style.color = 'var(--color-danger)';
    } else {
      messageDiv.style.color = 'var(--color-success)';
    }
    messageDiv.style.marginTop = '12px';
    messageDiv.style.textAlign = 'center';
  }
});
