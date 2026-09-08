/**
 * PortfolioAI - Contact Support
 *
 * APPROACH: I dynamically create the entire modal via JavaScript
 * and inject it as a direct child of <body>. This completely
 * avoids all stacking-context, overflow, and z-index issues that
 * occur on builder.html where the page layout uses
 * position:sticky, overflow:hidden, and transforms.
 *
 * There is NO modal HTML in any page — this script is the
 * single source of truth for the contact modal on every page.
 */

(function () {
  'use strict';

  // ── EmailJS Init ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs !== 'undefined') {
      emailjs.init('zdR0_Y3ehKs93-S0c');
    }
  });

  // ── Build Modal Styles ─────────────────────────────────────────
  function _injectStyles() {
    if (document.getElementById('contact-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'contact-modal-styles';
    style.textContent = `
      #contact-modal-js {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        right: 0 !important; bottom: 0 !important;
        width: 100vw !important; height: 100vh !important;
        z-index: 2147483647 !important;
        background: rgba(10, 10, 20, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        animation: cm-fade-in 0.2s ease;
      }
      @keyframes cm-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      #contact-modal-js .cm-card {
        background: var(--color-surface, #1a1a2e);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 16px;
        padding: 32px;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        animation: cm-slide-in 0.25s ease;
        position: relative;
        color: var(--color-text, #e2e8f0);
        font-family: 'Inter', sans-serif;
      }
      @keyframes cm-slide-in {
        from { transform: translateY(-16px); opacity: 0; }
        to   { transform: translateY(0);     opacity: 1; }
      }
      #contact-modal-js .cm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      #contact-modal-js .cm-title {
        font-family: 'Space Grotesk', 'Inter', sans-serif;
        font-size: 1.2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #a78bfa, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
      }
      #contact-modal-js .cm-close {
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        line-height: 1;
        transition: color 0.2s, background 0.2s;
      }
      #contact-modal-js .cm-close:hover {
        color: #fff;
        background: rgba(255,255,255,0.1);
      }
      #contact-modal-js .cm-group {
        margin-bottom: 14px;
      }
      #contact-modal-js .cm-group label {
        display: block;
        font-size: 0.82rem;
        font-weight: 500;
        color: rgba(255,255,255,0.65);
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      #contact-modal-js .cm-group input,
      #contact-modal-js .cm-group textarea {
        width: 100%;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 8px;
        padding: 10px 12px;
        color: #fff;
        font-size: 0.9rem;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s;
        resize: vertical;
      }
      #contact-modal-js .cm-group input:focus,
      #contact-modal-js .cm-group textarea:focus {
        border-color: #818cf8;
      }
      #contact-modal-js .cm-msg {
        font-size: 0.84rem;
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 12px;
        display: none;
      }
      #contact-modal-js .cm-msg.error {
        background: rgba(246,79,89,0.15);
        color: #f64f59;
        border: 1px solid rgba(246,79,89,0.3);
        display: block;
      }
      #contact-modal-js .cm-msg.success {
        background: rgba(16,185,129,0.15);
        color: #10b981;
        border: 1px solid rgba(16,185,129,0.3);
        display: block;
      }
      #contact-modal-js .cm-actions {
        display: flex;
        gap: 10px;
        margin-top: 18px;
        justify-content: flex-end;
      }
      #contact-modal-js .cm-btn {
        padding: 9px 20px;
        border-radius: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: opacity 0.2s, transform 0.1s;
        font-family: 'Inter', sans-serif;
      }
      #contact-modal-js .cm-btn:active { transform: scale(0.97); }
      #contact-modal-js .cm-btn-cancel {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.7);
        border: 1px solid rgba(255,255,255,0.12);
      }
      #contact-modal-js .cm-btn-cancel:hover { background: rgba(255,255,255,0.14); }
      #contact-modal-js .cm-btn-send {
        background: linear-gradient(135deg, #6366f1, #818cf8);
        color: #fff;
        box-shadow: 0 4px 15px rgba(99,102,241,0.4);
      }
      #contact-modal-js .cm-btn-send:hover { opacity: 0.9; }
      #contact-modal-js .cm-btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    document.head.appendChild(style);
  }

  // ── Build & Show Modal ─────────────────────────────────────────
  function openContactModal() {
    // Remove any existing instance first (safety)
    const existing = document.getElementById('contact-modal-js');
    if (existing) existing.remove();

    _injectStyles();

    const modal = document.createElement('div');
    modal.id = 'contact-modal-js';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Contact Support');

    modal.innerHTML = `
      <div class="cm-card">
        <div class="cm-header">
          <h3 class="cm-title">✉️ Contact Support</h3>
          <button class="cm-close" id="cm-close-btn" aria-label="Close">✕</button>
        </div>
        <form id="cm-form" novalidate>
          <div class="cm-group">
            <label for="cm-name">Full Name</label>
            <input type="text" id="cm-name" placeholder="Your name" required autocomplete="name">
          </div>
          <div class="cm-group">
            <label for="cm-email">Email Address</label>
            <input type="email" id="cm-email" placeholder="your@email.com" required autocomplete="email">
          </div>
          <div class="cm-group">
            <label for="cm-message">Message</label>
            <textarea id="cm-message" rows="4" placeholder="How can we help you?" required></textarea>
          </div>
          <div class="cm-msg" id="cm-msg"></div>
          <div class="cm-actions">
            <button type="button" class="cm-btn cm-btn-cancel" id="cm-cancel-btn">Cancel</button>
            <button type="submit" class="cm-btn cm-btn-send" id="cm-send-btn">Send Message</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus first input
    setTimeout(() => {
      const nameInput = document.getElementById('cm-name');
      if (nameInput) nameInput.focus();
    }, 100);

    // Close handlers
    const closeBtn  = modal.querySelector('#cm-close-btn');
    const cancelBtn = modal.querySelector('#cm-cancel-btn');

    function close() { modal.remove(); }

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    // Escape key
    function onKey(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
    }
    document.addEventListener('keydown', onKey);

    // Form submit
    const form    = modal.querySelector('#cm-form');
    const sendBtn = modal.querySelector('#cm-send-btn');
    const msgDiv  = modal.querySelector('#cm-msg');

    function showMsg(text, type) {
      msgDiv.textContent = text;
      msgDiv.className = 'cm-msg ' + type;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msgDiv.className = 'cm-msg';

      const name    = document.getElementById('cm-name').value.trim();
      const email   = document.getElementById('cm-email').value.trim();
      const message = document.getElementById('cm-message').value.trim();

      if (!name || !email || !message) {
        return showMsg('Please fill in all fields.', 'error');
      }

      const original = sendBtn.textContent;
      sendBtn.textContent = 'Sending...';
      sendBtn.disabled = true;

      try {
        if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');
        await emailjs.send('service_o1kpq3g', 'template_rr1ng4i', {
          from_name: name, from_email: email,
          message, website_name: 'PortfolioAI'
        });
        showMsg('✅ Message sent! We will get back to you soon.', 'success');
        form.reset();
        setTimeout(close, 2500);
      } catch (err) {
        console.error('EmailJS Error:', err);
        showMsg('Failed to send. Please try again later.', 'error');
      } finally {
        sendBtn.textContent = original;
        sendBtn.disabled = false;
      }
    });
  }

  // Expose globally so onclick="openContactModal()" in HTML works
  window.openContactModal = openContactModal;

  // Legacy no-op for closeContactModal (not needed anymore since
  // the dynamically created modal removes itself, but keep it so
  // any existing onclick="closeContactModal()" in HTML doesn't error)
  window.closeContactModal = function () {
    const m = document.getElementById('contact-modal-js');
    if (m) m.remove();
  };

})();
