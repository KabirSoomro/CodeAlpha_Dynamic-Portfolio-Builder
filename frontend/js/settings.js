/* ============================================================
   settings.js — Dashboard Profile Settings
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');
  
  const nameInput = document.getElementById('settings-name');
  const emailInput = document.getElementById('settings-email');
  const avatarUpload = document.getElementById('avatar-upload');
  const avatarPreview = document.getElementById('settings-avatar-preview');
  const avatarPlaceholder = document.getElementById('settings-avatar-placeholder');
  const messageDiv = document.getElementById('settings-message');

  const navAvatar = document.getElementById('nav-avatar');
  const navName = document.getElementById('user-name-nav');

  let currentAvatarBase64 = null;

  // 1. Open Modal and populate current user data
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        nameInput.value = user.name || '';
        emailInput.value = user.email || '';
        
        if (user.avatar) {
          currentAvatarBase64 = user.avatar;
          avatarPreview.src = user.avatar;
          avatarPreview.style.display = 'block';
          avatarPlaceholder.style.display = 'none';
        } else {
          avatarPreview.style.display = 'none';
          avatarPlaceholder.style.display = 'flex';
        }
      }
      settingsModal.classList.add('active');
      if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
      }
    });
  }

  // 2. Close Modal
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('active');
    });
  }

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('active');
    }
  });

  // 3. Handle Avatar File Selection
  if (avatarUpload) {
    avatarUpload.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        // Validate size (max 2MB to not overload DB string length)
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

  // 4. Handle Form Submission
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const token = localStorage.getItem('token');
      if (!token) return;

      const submitBtn = settingsForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/updatedetails', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: nameInput.value,
            email: emailInput.value,
            avatar: currentAvatarBase64
          })
        });

        const data = await response.json();

        if (data.success) {
          showMessage('Profile updated successfully!', 'success');
          
          // Update local storage
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Update UI
          if (navName) navName.textContent = data.user.name;
          if (navAvatar && data.user.avatar) {
            navAvatar.src = data.user.avatar;
            navAvatar.style.display = 'block';
          }
          
          // Optional: automatically close modal after a moment
          setTimeout(() => {
            settingsModal.classList.remove('active');
          }, 1500);
        } else {
          showMessage(data.message || 'Update failed', 'error');
        }
      } catch (err) {
        showMessage('Server error. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Set initial UI state for avatar in navbar if exists
  const storedUser = localStorage.getItem('user');
  if (storedUser && navAvatar) {
    const user = JSON.parse(storedUser);
    if (user.avatar) {
      navAvatar.src = user.avatar;
      navAvatar.style.display = 'block';
    }
  }

  function showMessage(text, type) {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `form-message ${type}`;
    // Add success/error colors explicitly for inline style since auth.css might not cover it fully here
    if (type === 'error') {
      messageDiv.style.color = 'var(--color-danger)';
    } else {
      messageDiv.style.color = 'var(--color-success)';
    }
    messageDiv.style.marginTop = '12px';
    messageDiv.style.textAlign = 'center';
  }
});
