/* ============================================================
   dashboard.js — Dashboard Page Logic
   
   I handle:
   1. Auth guard (redirect to login if no token)
   2. Loading user data and portfolio stats from the API
   3. Populating the portfolio snapshot card
   4. Portfolio deletion with confirmation modal
   5. Animated stat number counter effect
============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── Auth Guard ────────────────────────────────────────────────
  Auth.requireAuth();

  // ── DOM References ────────────────────────────────────────────
  const userNameNav      = document.getElementById('user-name-nav');
  const welcomeHeading   = document.getElementById('welcome-heading');
  const logoutBtn        = document.getElementById('logout-btn');

  // Stats
  const completionPercent= document.getElementById('completion-percent');
  const completionBar    = document.getElementById('completion-bar');
  const expCount         = document.getElementById('exp-count');
  const eduCount         = document.getElementById('edu-count');
  const projCount        = document.getElementById('proj-count');

  // Snapshot
  const snapshotPlaceholder = document.getElementById('snapshot-placeholder');
  const snapshotContent     = document.getElementById('snapshot-content');
  const snapName            = document.getElementById('snap-name');
  const snapJobTitle        = document.getElementById('snap-job-title');
  const snapEmail           = document.getElementById('snap-email');
  const snapAvatarInitials  = document.getElementById('snap-avatar-initials');
  const snapSummary         = document.getElementById('snap-summary');
  const snapTech            = document.getElementById('snap-tech');

  // Delete modal
  const deleteModal     = document.getElementById('delete-modal');
  const confirmDeleteBtn= document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const actionDelete    = document.getElementById('action-delete');

  // Download PDF from dashboard
  const actionDownload  = document.getElementById('action-download');

  // ── Load User From Storage ────────────────────────────────────
  const user = Auth.getUser();
  if (user?.name) {
    userNameNav.textContent = user.name;
    welcomeHeading.textContent = `Welcome back, ${user.name}! 👋`;
  }

  // ── Fetch Portfolio Data ──────────────────────────────────────
  // I always fetch fresh data from the API rather than relying
  // solely on localStorage to ensure the dashboard reflects
  // the latest saved state.
  let portfolioData = null;

  try {
    const res = await apiFetch('/portfolio/me');
    if (res?.success && res.portfolio) {
      portfolioData = res.portfolio;
    }
  } catch (err) {
    console.error('[Dashboard] Failed to fetch portfolio:', err);
  }

  // ── Populate Stats ────────────────────────────────────────────
  if (portfolioData) {
    const expLen  = portfolioData.experience?.length || 0;
    const eduLen  = portfolioData.education?.length  || 0;
    const projLen = portfolioData.projects?.length   || 0;

    // I animate count-up numbers for a premium feel
    animateCounter(expCount,  expLen);
    animateCounter(eduCount,  eduLen);
    animateCounter(projCount, projLen);

    // I compute a rough "completion percentage" based on how many
    // of the key fields are filled in — a simple heuristic that
    // gives users a motivating goal to reach 100%.
    const fields = [
      portfolioData.fullName,
      portfolioData.jobTitle,
      portfolioData.email,
      portfolioData.summary,
      portfolioData.techStack?.length > 0,
      expLen > 0,
      eduLen > 0,
    ];
    const filled  = fields.filter(Boolean).length;
    const percent = Math.round((filled / fields.length) * 100);

    animateCounter(completionPercent, percent, '%');

    // I delay the bar animation slightly so it plays after the
    // number counter — gives a satisfying cascade effect.
    setTimeout(() => {
      completionBar.style.width = `${percent}%`;
    }, 200);

    // ── Populate Snapshot Card ────────────────────────────────
    if (portfolioData.fullName || portfolioData.jobTitle) {
      snapName.textContent    = portfolioData.fullName     || '—';
      snapJobTitle.textContent= portfolioData.jobTitle     || '';
      snapEmail.textContent   = portfolioData.email        || '';

      // I generate initials from the full name for the avatar fallback
      const initials = (portfolioData.fullName || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      snapAvatarInitials.textContent = initials;

      snapSummary.textContent = portfolioData.summary || '';

      // I render tech stack as pills
      snapTech.innerHTML = (portfolioData.techStack || [])
        .slice(0, 8) // I cap at 8 to keep the snapshot tidy
        .map((t) => `<span class="tech-pill">${t}</span>`)
        .join('');

      snapshotPlaceholder.hidden = true;
      snapshotContent.hidden     = false;
    }
  }

  // ── Animated Counter ──────────────────────────────────────────
  // I use requestAnimationFrame to animate numbers from 0 to the
  // target value over 800ms. This creates the "live dashboard"
  // feel without any heavy animation library.
  function animateCounter(el, target, suffix = '') {
    const duration = 800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // I use an ease-out quad curve for the animation
      const eased    = 1 - (1 - progress) ** 2;
      const value    = Math.round(eased * target);

      el.textContent = value + suffix;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ── Logout ────────────────────────────────────────────────────
  logoutBtn.addEventListener('click', () => {
    Auth.clear();
    window.location.href = 'index.html';
  });

  // ── Delete Portfolio (Modal) ──────────────────────────────────
  actionDelete.addEventListener('click', () => {
    deleteModal.hidden = false;
    // I trap focus in the modal for accessibility
    confirmDeleteBtn.focus();
  });

  cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.hidden = true;
  });

  // I close the modal if the user clicks the backdrop
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) deleteModal.hidden = true;
  });

  confirmDeleteBtn.addEventListener('click', async () => {
    confirmDeleteBtn.textContent = 'Deleting...';
    confirmDeleteBtn.disabled = true;

    const res = await apiFetch('/portfolio', { method: 'DELETE' });

    if (res?.success) {
      // I reload the page so all stats reset to zero
      window.location.reload();
    } else {
      confirmDeleteBtn.textContent = 'Yes, Delete It';
      confirmDeleteBtn.disabled = false;
      alert(res?.message || 'Delete failed. Please try again.');
    }
  });

  // ── Download PDF (Dashboard Shortcut) ────────────────────────
  // I redirect to the builder page and trigger PDF download there
  // because html2pdf.js needs the #resume-preview DOM to exist.
  actionDownload.addEventListener('click', () => {
    window.location.href = 'builder.html?action=pdf';
  });

}); // end DOMContentLoaded
