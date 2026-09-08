/**
 * PortfolioAI - Contact Support Logic
 * Initializes EmailJS and handles the contact modal submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS with Public Key
  if (typeof emailjs !== 'undefined') {
    emailjs.init("zdR0_Y3ehKs93-S0c");
  }

  const contactModal = document.getElementById('contact-modal');
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const errorDiv = document.getElementById('contact-error');
  const successDiv = document.getElementById('contact-success');

  // Close modal when clicking outside the card
  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        closeContactModal();
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous messages
      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';

      // Gather form data
      const fromName = document.getElementById('contact-name').value.trim();
      const fromEmail = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!fromName || !fromEmail || !message) {
        errorDiv.textContent = 'Please fill in all fields.';
        errorDiv.style.display = 'block';
        return;
      }

      // Prepare template parameters
      const templateParams = {
        from_name: fromName,
        from_email: fromEmail,
        message: message,
        website_name: 'PortfolioAI'
      };

      // Loading state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        await emailjs.send('service_o1kpq3g', 'template_rr1ng4i', templateParams);
        
        // Success
        successDiv.textContent = 'Your message has been sent successfully! We will get back to you soon.';
        successDiv.style.display = 'block';
        contactForm.reset();
        
        // Close modal after 3 seconds on success
        setTimeout(() => {
          closeContactModal();
          successDiv.style.display = 'none';
        }, 3000);
      } catch (error) {
        console.error('EmailJS Error:', error);
        errorDiv.textContent = 'Failed to send message. Please try again later.';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

function openContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.zIndex = '99999'; // Force it to the top
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Clear previous states safely
    const form = document.getElementById('contact-form');
    if (form && typeof form.reset === 'function') form.reset();
    
    const errDiv = document.getElementById('contact-error');
    if (errDiv) errDiv.style.display = 'none';
    
    const succDiv = document.getElementById('contact-success');
    if (succDiv) succDiv.style.display = 'none';
  }
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}
