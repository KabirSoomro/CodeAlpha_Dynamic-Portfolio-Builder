/**
 * PortfolioAI - Privacy Policy & Terms of Service Dynamic Modals
 *
 * Provides openPrivacyModal() and openTermsModal() accessible from any page.
 * Renders an accessible, glassmorphism modal with:
 * - Direct tab switching between Privacy Policy and Terms of Service
 * - Print / Save PDF capability
 * - Link to standalone full page (privacy.html / terms.html)
 * - Backdrop blur, Escape key, and outside-click dismissal
 */

(function () {
  'use strict';

  const LEGAL_CONTENT = {
    privacy: {
      title: 'Privacy Policy',
      icon: '🔒',
      lastUpdated: 'March 2026',
      fullPageUrl: 'privacy.html',
      html: `
        <div class="legal-badge">Effective Date: March 2026 • Version 1.2</div>
        <p class="legal-intro">
          At <strong>PortfolioAI</strong> (developed by <strong>Kabeer Soomro</strong> for <strong>CodeAlpha</strong>), we take your privacy and personal data seriously. This Privacy Policy explains what information we collect when you use our Dynamic Portfolio & ATS Resume Builder platform, how we use it, how we protect it, and the rights you have over your data.
        </p>

        <div class="legal-section">
          <h4>1. Information We Collect</h4>
          <p>We collect information to provide, personalize, and optimize our resume building and portfolio hosting services:</p>
          <ul>
            <li><strong>Account Information:</strong> When you register, we collect your full name, email address, and encrypted password (hashed with bcrypt, never stored in plain text). You may also optionally upload an avatar image.</li>
            <li><strong>Resume & Portfolio Content:</strong> Information you enter into the builder, including job titles, contact details (phone, address/location, website, social links), work history, educational background, project portfolios, and technical skill tags.</li>
            <li><strong>Uploaded Documents (AI OCR):</strong> When you upload an existing resume (PDF or image) to parse with our AI OCR importer, the document is processed client-side via modern in-browser OCR technologies to extract text directly into your editor fields.</li>
            <li><strong>Technical & Session Data:</strong> Standard browser headers, device viewport dimensions, and timestamps used solely for session authentication (JWT) and error diagnostics.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>2. How We Use Your Information</h4>
          <p>Your information is used strictly to power your PortfolioAI experience:</p>
          <ul>
            <li>To generate, render, and update your personal portfolio web page and ATS-compliant downloadable PDF resumes.</li>
            <li>To authenticate your identity, preserve your saved draft states, and manage session security.</li>
            <li>To process support inquiries and correspondence submitted via our Contact Support feature.</li>
            <li>To detect, prevent, and remediate technical faults or malicious access attempts.</li>
          </ul>
          <div class="legal-callout">
            <strong>🛡️ Our Guarantee:</strong> We <strong>DO NOT</strong> sell, rent, monetize, or trade your personal career information to third-party advertising networks, recruiters, or data brokers.
          </div>
        </div>

        <div class="legal-section">
          <h4>3. Data Storage & Security Safeguards</h4>
          <p>We implement multi-layered industry-standard security protocols to protect your personal data:</p>
          <ul>
            <li><strong>Data Encryption:</strong> All client-server communication is encrypted in transit using SSL/TLS protocols.</li>
            <li><strong>Password Security:</strong> User passwords undergo salted bcrypt hashing (12 rounds), ensuring they can never be reversed or viewed by anyone.</li>
            <li><strong>Token Authorization:</strong> Secure JSON Web Tokens (JWT) are employed for state verification with automatic expiration controls.</li>
            <li><strong>Database Isolation:</strong> User profiles and portfolio entries are linked by unique MongoDB ObjectIds to maintain strict tenant data isolation.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>4. Your Rights & Data Ownership</h4>
          <p>You have full ownership and control over your resume and personal data:</p>
          <ul>
            <li><strong>Right of Access & Modification:</strong> You can edit any section of your resume, account name, email, or avatar at any time via the Editor and Settings modal.</li>
            <li><strong>Right to Export:</strong> You can download your resume as an ATS-compatible PDF free of charge at any time.</li>
            <li><strong>Right to Deletion ("Right to be Forgotten"):</strong> You can permanently wipe your portfolio records via the "Reset Portfolio" action on your dashboard, or submit a full account deletion request.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>5. Third-Party Integrations</h4>
          <p>To provide high-quality services, we interface with trusted infrastructure providers who adhere to strict data privacy regulations:</p>
          <ul>
            <li><strong>MongoDB Atlas:</strong> Encrypted cloud database infrastructure for storing user accounts and portfolio records.</li>
            <li><strong>EmailJS:</strong> Secure API proxy used to route Contact Support messages without exposing private server credentials.</li>
            <li><strong>Google Fonts & CDNs:</strong> Used for fast, reliable delivery of modern web typography and client-side rendering engines (html2pdf, SortableJS).</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>6. Cookies & Client Storage</h4>
          <p>We use browser <code>localStorage</code> solely for functional authentication persistence (storing your JWT token and display preferences such as dark/light theme). We do not deploy third-party advertising tracking cookies.</p>
        </div>

        <div class="legal-section">
          <h4>7. Contact & Inquiries</h4>
          <p>If you have any questions or data requests regarding this Privacy Policy, please contact our developer:</p>
          <ul>
            <li><strong>Developer:</strong> Kabeer Soomro</li>
            <li><strong>Program:</strong> CodeAlpha Internship Project</li>
            <li><strong>Email:</strong> <a href="mailto:gkabeersoomro@gmail.com">gkabeersoomro@gmail.com</a></li>
            <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/kabir-soomro" target="_blank" rel="noopener">linkedin.com/in/kabir-soomro</a></li>
          </ul>
        </div>
      `
    },
    terms: {
      title: 'Terms of Service',
      icon: '📜',
      lastUpdated: 'March 2026',
      fullPageUrl: 'terms.html',
      html: `
        <div class="legal-badge">Effective Date: March 2026 • Version 1.2</div>
        <p class="legal-intro">
          Welcome to <strong>PortfolioAI</strong>. These Terms of Service ("Terms") govern your access to and use of the PortfolioAI dynamic portfolio and resume builder web application, developed by <strong>Kabeer Soomro</strong> for <strong>CodeAlpha</strong>. By registering, accessing, or using the platform, you agree to be bound by these Terms.
        </p>

        <div class="legal-section">
          <h4>1. Acceptance of Terms</h4>
          <p>By creating an account, browsing the site, or utilizing our resume generation tools, you confirm that you are at least 13 years old, legally capable of entering into binding agreements, and that you accept all provisions set forth herein. If you do not agree to these terms, you must discontinue using PortfolioAI immediately.</p>
        </div>

        <div class="legal-section">
          <h4>2. Description of Service</h4>
          <p>PortfolioAI is a modern web application designed to empower professionals to:</p>
          <ul>
            <li>Create, design, and manage personalized dynamic portfolios and resumes in real time.</li>
            <li>Import existing resumes via AI OCR document parsing.</li>
            <li>Preview resumes dynamically across devices and export ATS-friendly PDF documents.</li>
            <li>Customize visual aesthetics, layout order, and accent colors.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>3. User Accounts & Security</h4>
          <p>To access the builder and dashboard features, you must register for an account. You agree to:</p>
          <ul>
            <li>Provide accurate, truthful, and up-to-date contact and career details.</li>
            <li>Safeguard your password and assume responsibility for all activities conducted under your credentials.</li>
            <li>Promptly notify us if you suspect unauthorized access or compromise of your account.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>4. Intellectual Property & Content Ownership</h4>
          <ul>
            <li><strong>Your Content:</strong> You retain 100% intellectual property ownership of all resumes, text descriptions, logos, photos, and project documentation you upload or create using PortfolioAI. We claim no ownership over your career data.</li>
            <li><strong>Platform License:</strong> You grant PortfolioAI a limited, non-exclusive license strictly to host, process, and render your content to provide the service to you.</li>
            <li><strong>Platform Rights:</strong> All software code, user interface designs, logos, CSS styling, brand assets, and custom algorithms are the intellectual property of Kabeer Soomro and CodeAlpha. You may not copy, reverse-engineer, redistribute, or create derivative works of the platform without prior written consent.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>5. Acceptable Use Policy</h4>
          <p>You agree NOT to engage in any of the following prohibited actions:</p>
          <ul>
            <li>Uploading false, deceptive, fraudulent, defamatory, or unlawful materials.</li>
            <li>Attempting to probe, exploit, or bypass backend API endpoints, authentication guards, or rate limits.</li>
            <li>Deploying automated scrapers, crawlers, or bot scripts without express authorization.</li>
            <li>Uploading malicious files, payloads, or executing cross-site scripting (XSS) attacks.</li>
            <li>Impersonating another person, company, or institution.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>6. Disclaimer of Warranties</h4>
          <p>PortfolioAI is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express, statutory, or implied. While we strive for optimal ATS resume compatibility, high uptime, and bug-free execution, we do not warrant that:</p>
          <ul>
            <li>The service will always operate uninterrupted, error-free, or entirely secure.</li>
            <li>The use of generated resumes will guarantee employment offers, interviews, or hiring outcomes.</li>
          </ul>
        </div>

        <div class="legal-section">
          <h4>7. Limitation of Liability</h4>
          <p>To the fullest extent permitted by law, Kabeer Soomro, CodeAlpha, and affiliated developers shall not be liable for any indirect, incidental, punitive, or consequential damages, loss of data, loss of career opportunities, or service interruptions arising out of your use or inability to use PortfolioAI.</p>
        </div>

        <div class="legal-section">
          <h4>8. Termination & Portfolio Reset</h4>
          <p>You may stop using PortfolioAI at any time. You can permanently wipe your portfolio records via the "Reset Portfolio" modal on your dashboard. We reserve the right to suspend or terminate accounts that breach these Terms or engage in disruptive behavior.</p>
        </div>

        <div class="legal-section">
          <h4>9. Modifications to Terms</h4>
          <p>We may amend these Terms periodically. Notice of significant revisions will be reflected in the "Last Updated" timestamp on this page. Your continued use of PortfolioAI following such modifications signifies acceptance of the revised Terms.</p>
        </div>

        <div class="legal-section">
          <h4>10. Governing Law & Contact</h4>
          <p>These Terms shall be interpreted under applicable commercial laws. For questions or legal notices, please reach out to:</p>
          <ul>
            <li><strong>Developer:</strong> Kabeer Soomro (CodeAlpha)</li>
            <li><strong>Email:</strong> <a href="mailto:gkabeersoomro@gmail.com">gkabeersoomro@gmail.com</a></li>
            <li><strong>Contact Support:</strong> Open the in-app support dialog from any page.</li>
          </ul>
        </div>
      `
    }
  };

  // ── Inject CSS Styles Once ────────────────────────────────────────
  function _injectLegalStyles() {
    if (document.getElementById('legal-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'legal-modal-styles';
    style.textContent = `
      #legal-modal-js {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        right: 0 !important; bottom: 0 !important;
        width: 100vw !important; height: 100vh !important;
        z-index: 2147483646 !important;
        background: rgba(10, 10, 20, 0.75);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        animation: lm-fade-in 0.22s ease;
      }
      @keyframes lm-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      #legal-modal-js .lm-card {
        background: var(--color-surface, #1e1e2f);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 20px;
        width: 100%;
        max-width: 720px;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.65);
        animation: lm-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        color: var(--color-text, #f1f5f9);
        font-family: var(--font-primary, 'Plus Jakarta Sans', system-ui, sans-serif);
        overflow: hidden;
      }
      @keyframes lm-slide-in {
        from { transform: translateY(24px) scale(0.96); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      #legal-modal-js .lm-header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: rgba(255, 255, 255, 0.02);
      }
      #legal-modal-js .lm-tabs {
        display: flex;
        gap: 8px;
        background: rgba(0, 0, 0, 0.25);
        padding: 4px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      #legal-modal-js .lm-tab {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--color-text-muted, #94a3b8);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      #legal-modal-js .lm-tab:hover {
        color: #ffffff;
      }
      #legal-modal-js .lm-tab.active {
        background: var(--color-accent, #6366f1);
        color: #ffffff;
        box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);
      }
      #legal-modal-js .lm-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #legal-modal-js .lm-btn-tool {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--color-text, #e2e8f0);
        padding: 7px 12px;
        border-radius: 8px;
        font-size: 0.82rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        transition: background 0.2s;
        font-family: inherit;
      }
      #legal-modal-js .lm-btn-tool:hover {
        background: rgba(255, 255, 255, 0.16);
      }
      #legal-modal-js .lm-close {
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: var(--color-text-muted, #94a3b8);
        font-size: 1.1rem;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, color 0.2s;
      }
      #legal-modal-js .lm-close:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
      #legal-modal-js .lm-body {
        padding: 24px 28px;
        overflow-y: auto;
        font-size: 0.92rem;
        line-height: 1.65;
        color: var(--color-text, #cbd5e1);
        scroll-behavior: smooth;
      }
      #legal-modal-js .legal-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 10px;
        border-radius: 9999px;
        background: rgba(99, 102, 241, 0.18);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.35);
        margin-bottom: 14px;
      }
      #legal-modal-js .legal-intro {
        font-size: 0.98rem;
        margin-bottom: 22px;
        color: var(--color-text, #e2e8f0);
      }
      #legal-modal-js .legal-section {
        margin-bottom: 22px;
        padding-bottom: 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      #legal-modal-js .legal-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      #legal-modal-js .legal-section h4 {
        font-size: 1.05rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 10px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #legal-modal-js .legal-section p {
        margin: 0 0 10px 0;
      }
      #legal-modal-js .legal-section ul {
        margin: 0 0 10px 20px;
        padding: 0;
      }
      #legal-modal-js .legal-section li {
        margin-bottom: 6px;
      }
      #legal-modal-js .legal-callout {
        background: rgba(99, 102, 241, 0.1);
        border-left: 4px solid var(--color-accent, #6366f1);
        padding: 12px 16px;
        border-radius: 0 8px 8px 0;
        margin: 12px 0;
        font-size: 0.88rem;
        color: #e2e8f0;
      }
      #legal-modal-js .legal-section a {
        color: #818cf8;
        text-decoration: underline;
      }
      #legal-modal-js .lm-footer {
        padding: 14px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--color-text-muted, #94a3b8);
      }
      @media (max-width: 640px) {
        #legal-modal-js .lm-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
        #legal-modal-js .lm-header-actions {
          justify-content: space-between;
        }
        #legal-modal-js .lm-tabs {
          width: 100%;
        }
        #legal-modal-js .lm-tab {
          flex: 1;
          justify-content: center;
          padding: 8px 10px;
        }
        #legal-modal-js .lm-body {
          padding: 18px 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Show Modal Function ──────────────────────────────────────────
  function showLegalModal(defaultTab = 'privacy') {
    // Remove existing if any
    const existing = document.getElementById('legal-modal-js');
    if (existing) existing.remove();

    _injectLegalStyles();

    let currentTab = defaultTab;

    const modal = document.createElement('div');
    modal.id = 'legal-modal-js';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', LEGAL_CONTENT[currentTab].title);

    function renderModalHTML() {
      const data = LEGAL_CONTENT[currentTab];
      modal.innerHTML = `
        <div class="lm-card" role="document">
          <div class="lm-header">
            <div class="lm-tabs" role="tablist">
              <button class="lm-tab ${currentTab === 'privacy' ? 'active' : ''}" data-tab="privacy" role="tab" aria-selected="${currentTab === 'privacy'}">
                <span>🔒</span> Privacy Policy
              </button>
              <button class="lm-tab ${currentTab === 'terms' ? 'active' : ''}" data-tab="terms" role="tab" aria-selected="${currentTab === 'terms'}">
                <span>📜</span> Terms of Service
              </button>
            </div>
            <div class="lm-header-actions">
              <button type="button" class="lm-btn-tool" id="lm-print-btn" title="Print or Save PDF">
                <span>🖨️</span> Print
              </button>
              <a href="${data.fullPageUrl}" target="_blank" rel="noopener" class="lm-btn-tool" title="Open full page in new tab">
                <span>↗</span> Full Page
              </a>
              <button class="lm-close" id="lm-close-btn" aria-label="Close modal">✕</button>
            </div>
          </div>

          <div class="lm-body" id="lm-content-body" tabindex="0">
            ${data.html}
          </div>

          <div class="lm-footer">
            <span>PortfolioAI Legal • CodeAlpha Project</span>
            <button type="button" class="lm-btn-tool" id="lm-footer-close-btn">Close</button>
          </div>
        </div>
      `;

      attachListeners();
    }

    function attachListeners() {
      // Tab switching
      modal.querySelectorAll('.lm-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          if (tab && tab !== currentTab) {
            currentTab = tab;
            renderModalHTML();
          }
        });
      });

      // Close handlers
      const closeBtn = modal.querySelector('#lm-close-btn');
      const footerCloseBtn = modal.querySelector('#lm-footer-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', close);
      if (footerCloseBtn) footerCloseBtn.addEventListener('click', close);

      // Print handler
      const printBtn = modal.querySelector('#lm-print-btn');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          window.print();
        });
      }
    }

    function close() {
      document.removeEventListener('keydown', onKey);
      modal.remove();
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    // Outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.addEventListener('keydown', onKey);

    renderModalHTML();
    document.body.appendChild(modal);

    // Focus scrollable body for accessibility
    setTimeout(() => {
      const body = modal.querySelector('#lm-content-body');
      if (body) body.focus();
    }, 100);
  }

  // ── Global Exports ───────────────────────────────────────────────
  window.openPrivacyModal = function () {
    showLegalModal('privacy');
  };

  window.openTermsModal = function () {
    showLegalModal('terms');
  };

  window.closeLegalModal = function () {
    const m = document.getElementById('legal-modal-js');
    if (m) m.remove();
  };

})();
