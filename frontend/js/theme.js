/* ============================================================
   theme.js — Dark & Light Mode Theme Controller
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const root = document.documentElement; // Apply theme to <html> tag for global consistency
  
  // 1. Determine Initial Theme
  // Default is light. Check localStorage first, then system preference.
  let currentTheme = localStorage.getItem('theme');
  if (!currentTheme) {
    // If no preference is saved, use light mode as default (as requested by previous redesign)
    currentTheme = 'light';
    localStorage.setItem('theme', currentTheme);
  }

  // Apply the theme immediately
  root.setAttribute('data-theme', currentTheme);
  updateToggleUI(currentTheme);

  // 2. Handle Theme Toggling
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      
      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleUI(newTheme);
    });
  });

  // Helper to update toggle button icons
  function updateToggleUI(theme) {
    themeToggleBtns.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = '☀️';
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        btn.innerHTML = '🌙';
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    });
  }
});
