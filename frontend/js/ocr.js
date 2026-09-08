/* ============================================================
   ocr.js — Tesseract.js OCR Resume Parsing Pipeline
   
   I handle the full OCR workflow here:
   1. User selects an image file
   2. I show a progress bar while Tesseract processes it
   3. I display the extracted raw text for review
   4. User clicks "Apply to Fields" — I parse the text and
      attempt to populate the state object in builder.js
   
   I use a heuristic parser (regex + keyword detection) rather
   than an AI model so there are zero API costs and it works
   completely offline in the browser.
   
   This runs after builder.js so window.builderState is available.
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM References ────────────────────────────────────────────
  const fileInput      = document.getElementById('ocr-file-input');
  const ocrProgress    = document.getElementById('ocr-progress');
  const progressFill   = document.getElementById('ocr-progress-fill');
  const progressText   = document.getElementById('ocr-progress-text');
  const ocrResult      = document.getElementById('ocr-result');
  const extractedText  = document.getElementById('ocr-extracted-text');
  const applyBtn       = document.getElementById('ocr-apply-btn');
  const dismissBtn     = document.getElementById('ocr-dismiss-btn');

  // I store the raw extracted text so the "Apply" button can
  // use it without re-running OCR.
  let rawExtractedText = '';

  // ── File Input Change Handler ─────────────────────────────────
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // I validate that the file is an image or PDF before running parsing
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload an image (JPG, PNG) or a PDF file.');
      return;
    }

    // I show the progress section and hide the result from any
    // previous run before starting the new scan.
    ocrProgress.hidden  = false;
    ocrResult.hidden    = true;
    progressFill.style.width = '0%';
    progressText.textContent = file.type === 'application/pdf' ? '📄 Reading PDF...' : '🔍 Loading OCR engine...';

    try {
      if (file.type === 'application/pdf') {
        // === PDF Parsing Logic ===
        progressFill.style.width = '30%';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        progressFill.style.width = '60%';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // Extract and join text items
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        rawExtractedText = fullText.trim();
        
        if (!rawExtractedText) {
          throw new Error('No text found in PDF. If this is a scanned document, please upload it as an image instead.');
        }
      } else {
        // === Image OCR Logic ===
        const worker = await Tesseract.createWorker('eng', 1, {
          logger: (log) => {
            if (log.status === 'recognizing text') {
              const percent = Math.round(log.progress * 100);
              progressFill.style.width = `${percent}%`;
              progressText.textContent = `🧠 Recognising text... ${percent}%`;
            } else {
              progressText.textContent = `⚙️ ${log.status}`;
            }
          },
        });

        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        rawExtractedText = text.trim();
      }

      // Show the extracted text in a preview area
      progressFill.style.width    = '100%';
      progressText.textContent    = '✅ Import Complete!';
      extractedText.textContent   = rawExtractedText || '(No text detected)';

      setTimeout(() => {
        ocrProgress.hidden = true;
        ocrResult.hidden   = false;
      }, 600);

    } catch (err) {
      console.error('[Import] parsing error:', err);
      progressText.textContent = `❌ Import failed: ${err.message || 'Please try a clearer file.'}`;
      ocrProgress.hidden = false;
    }

    // I reset the file input so the user can upload a different
    // image if they want to re-scan.
    fileInput.value = '';
  });

  // ── Apply Extracted Text to Form Fields ──────────────────────
  applyBtn.addEventListener('click', () => {
    if (!rawExtractedText) return;

    parseAndPopulate(rawExtractedText);
    ocrResult.hidden = true;

    // I show a brief success notification
    showOCRToast('✅ Fields populated from your resume!');
  });

  // ── Dismiss OCR Result ────────────────────────────────────────
  dismissBtn.addEventListener('click', () => {
    ocrResult.hidden    = true;
    ocrProgress.hidden  = true;
    rawExtractedText    = '';
  });

  // ══════════════════════════════════════════════════════════════
  //  HEURISTIC TEXT PARSER
  //  I am using regex-based heuristics to extract structured data
  //  from the unstructured OCR output. This is NOT a perfect
  //  parser — it works best on clean, well-formatted resumes.
  //  I document each pattern so they can be tuned easily.
  // ══════════════════════════════════════════════════════════════

  function parseAndPopulate(text) {
    const state = window.builderState;
    if (!state) return;

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // ── Email ─────────────────────────────────────────────────
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch && !state.email) {
      state.email = emailMatch[0];
      setFieldValue('[data-field="email"]', emailMatch[0]);
    }

    // ── Phone ─────────────────────────────────────────────────
    // I match common phone formats: +1 555-555-5555, (555) 555-5555, etc.
    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,15}\d)/);
    if (phoneMatch && !state.phone) {
      state.phone = phoneMatch[0].trim();
      setFieldValue('[data-field="phone"]', state.phone);
    }

    // ── Name (first non-empty line heuristic) ─────────────────
    // I assume the very first line of a resume is the candidate's name.
    if (lines[0] && lines[0].length < 60 && !state.fullName) {
      // I exclude lines that look like URLs or emails
      if (!lines[0].includes('@') && !lines[0].includes('http')) {
        state.fullName = lines[0];
        setFieldValue('[data-field="fullName"]', lines[0]);
      }
    }

    // ── Job Title (second line heuristic) ─────────────────────
    if (lines[1] && lines[1].length < 80 && !state.jobTitle) {
      const titleKeywords = ['developer', 'engineer', 'designer', 'manager',
                              'analyst', 'architect', 'lead', 'scientist', 'consultant'];
      const lowerLine = lines[1].toLowerCase();
      if (titleKeywords.some((k) => lowerLine.includes(k))) {
        state.jobTitle = lines[1];
        setFieldValue('[data-field="jobTitle"]', lines[1]);
      }
    }

    // ── Summary Detection ─────────────────────────────────────
    // I look for lines following "Summary", "Profile", "Objective"
    const summaryIdx = lines.findIndex((l) =>
      /^(summary|profile|about|objective)/i.test(l)
    );
    if (summaryIdx !== -1 && !state.summary) {
      // I take the next 2-4 lines as the summary content
      const summaryLines = lines.slice(summaryIdx + 1, summaryIdx + 5)
        .filter((l) => l.length > 20 && !/^(experience|education|skills)/i.test(l));
      if (summaryLines.length > 0) {
        state.summary = summaryLines.join(' ');
        setFieldValue('[data-field="summary"]', state.summary);
      }
    }

    // ── Skills Detection ──────────────────────────────────────
    // I find lines following "Skills", "Tech Stack", "Technologies"
    const skillsIdx = lines.findIndex((l) =>
      /^(skills|technologies|tech stack|tools)/i.test(l)
    );
    if (skillsIdx !== -1) {
      // I scan the next 5 lines for comma/pipe separated skills
      const skillLines = lines.slice(skillsIdx + 1, skillsIdx + 6);
      const extracted = skillLines.join(' ');
      const skills = extracted.split(/[,|•·\n]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 30);

      skills.forEach((skill) => {
        if (!state.techStack.includes(skill)) {
          state.techStack.push(skill);
        }
      });

      // I re-render the skills pills section after populating
      if (window.builderSave) {
        // I trigger re-render by calling the exposed render function
        document.getElementById('skills-pills-container').dispatchEvent(
          new CustomEvent('ocr-skills-updated')
        );
      }
    }

    // ── Experience Block Detection ────────────────────────────
    const expIdx = lines.findIndex((l) => /^(experience|work history|employment)/i.test(l));
    if (expIdx !== -1) {
      // I collect lines in the experience section until the next major heading
      const expLines = [];
      for (let i = expIdx + 1; i < lines.length; i++) {
        if (/^(education|skills|projects|certifications)/i.test(lines[i])) break;
        expLines.push(lines[i]);
      }

      // I attempt to group lines into experience entries by detecting
      // date patterns (Year – Year) as entry boundaries
      const datePattern = /\d{4}/;
      let currentEntry = null;

      expLines.forEach((line) => {
        if (datePattern.test(line) && line.length < 50) {
          // New entry detected — push previous if exists
          if (currentEntry) state.experience.push(currentEntry);
          currentEntry = {
            jobTitle: '', company: '', location: '',
            startDate: '', endDate: line, description: '', isCurrent: false,
          };
        } else if (currentEntry) {
          if (!currentEntry.jobTitle) currentEntry.jobTitle = line;
          else if (!currentEntry.company) currentEntry.company = line;
          else currentEntry.description += (currentEntry.description ? ' ' : '') + line;
        }
      });

      if (currentEntry) state.experience.push(currentEntry);

      // I re-render the experience section with the populated data
      if (window.renderExpList) window.renderExpList();
    }

    // ── Trigger auto-save after OCR population ────────────────
    if (window.builderSave) window.builderSave();
    // I re-render the full preview to show all updated fields
    if (window.renderFullPreview) window.renderFullPreview();
  }

  // ── Helper: Set Input Value ───────────────────────────────────
  function setFieldValue(selector, value) {
    const el = document.querySelector(selector);
    if (el) {
      el.value = value;
      // I dispatch an input event so the real-time binding in
      // builder.js picks up the change and updates the preview.
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // ── Toast Notification ────────────────────────────────────────
  function showOCRToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      background: linear-gradient(135deg, #43e97b, #38f9d7);
      color: #1a1a2e; font-weight: 700; font-size: 0.9rem;
      padding: 12px 24px; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(67,233,123,0.4);
      z-index: 9999; animation: slide-up 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

}); // end DOMContentLoaded
