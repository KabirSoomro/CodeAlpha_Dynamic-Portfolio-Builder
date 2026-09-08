/* ============================================================
   pdf.js — html2pdf.js Export Engine
   
   I handle the "Download PDF" button here. My goal is to produce
   a high-quality, ATS-friendly PDF that renders identically to
   the on-screen preview.
   
   Key decisions I made:
   - I target the #resume-preview element (white paper div)
     instead of the full page so the dark glass UI is NOT included
   - I use scale:2 for retina-quality text rendering
   - I set margin:0 so the PDF fills the page edge-to-edge
   - I disable links in the PDF since most ATS systems don't
     follow hyperlinks anyway (they just extract text)
   
   This runs after builder.js so the DOM is fully populated.
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const downloadBtn = document.getElementById('download-pdf-btn');

  // ── html2pdf.js Options ───────────────────────────────────────
  // I configure these options once and reuse them so the export
  // behaviour is consistent regardless of who triggers the download
  // (the navbar button OR the dashboard shortcut).
  const pdfOptions = {
    margin:      0,
    filename:    'resume.pdf',  // I override this with the user's name at runtime
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,            // I use 2x scale for crisp text in the PDF
      useCORS: true,       // I enable CORS so avatar images load correctly
      logging: false,      // I suppress console noise during export
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',        // I use A4 which is the standard for most ATS systems
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  // ── Download Trigger ──────────────────────────────────────────
  downloadBtn.addEventListener('click', () => downloadPDF());

  /**
   * downloadPDF — converts #resume-preview to a PDF and saves it.
   *
   * I expose this on window.pdf so dashboard.js can call it
   * when redirecting with ?action=pdf.
   */
  async function downloadPDF() {
    const resumeEl = document.getElementById('resume-preview');

    if (!resumeEl) {
      console.error('[PDF] #resume-preview element not found');
      return;
    }

    // I dynamically set the filename to include the user's name
    // so the downloaded file is immediately identifiable.
    const state     = window.builderState;
    const userName  = state?.fullName?.replace(/\s+/g, '_') || 'resume';
    pdfOptions.filename = `${userName}_Resume.pdf`;

    // I update the button to show loading state so the user
    // knows the export is processing (html2canvas can take 1-3s).
    downloadBtn.textContent = '⏳ Generating PDF...';
    downloadBtn.disabled = true;

    try {
      // I check that html2pdf is loaded before calling it
      if (typeof html2pdf === 'undefined') {
        throw new Error('html2pdf.js library is not loaded. Check the CDN script tag.');
      }

      await html2pdf().set(pdfOptions).from(resumeEl).save();

    } catch (err) {
      console.error('[PDF] Export error:', err);
      alert('PDF export failed. Please try again.\n\nError: ' + err.message);
    } finally {
      // I always restore the button regardless of success or failure
      downloadBtn.textContent = '📄 Download PDF';
      downloadBtn.disabled = false;
    }
  }

  // I expose the function globally so it can be called externally
  window.pdf = { downloadPDF };

}); // end DOMContentLoaded
