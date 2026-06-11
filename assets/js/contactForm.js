// Character counter for message box
  const cfMessage = document.getElementById('cf-message');
  const cfCharCount = document.getElementById('cf-char-count');
  if (cfMessage && cfCharCount) {
    cfMessage.addEventListener('input', function() {
      const remaining = 500 - this.value.length;
      cfCharCount.textContent = remaining + ' characters remaining';
      cfCharCount.style.color = remaining < 100 ? '#ef4444' : remaining < 200 ? '#f97316' : '#94a3b8';
    });
  }

  // Scroll to hash on page load (e.g. from ../index.html#contact)
  window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          const offset = document.querySelector('header').offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 400);
      }
    }
  });

  document.getElementById('bk-date').min = new Date().toISOString().split('T')[0];

  function openBookingModal() {
    const title = document.getElementById('propModalTitle').textContent;
    document.getElementById('bk-property').value = title;
    document.getElementById('bk-success').style.display = 'none';
    document.getElementById('bookingForm').reset();
    document.getElementById('bk-property').value = title;
    document.getElementById('bk-date').min = new Date().toISOString().split('T')[0];
    document.getElementById('bookingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  document.getElementById('bookingClose').addEventListener('click', () => {
    document.getElementById('bookingModal').classList.remove('active');
    document.body.style.overflow = '';
  });

  document.getElementById('bookingModal').addEventListener('click', e => {
    if (e.target === document.getElementById('bookingModal')) {
      document.getElementById('bookingModal').classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Honeypot check
    if (this.querySelector('input[name="website"]').value) return;
    let valid = true;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
    const fields = [
      { id: 'bk-name',  err: 'bk-err-name',  msg: 'Please enter your name.' },
      { id: 'bk-phone', err: 'bk-err-phone', msg: 'Please enter a valid phone number.', pattern: phoneRegex },
      { id: 'bk-email', err: 'bk-err-email', msg: 'Please enter a valid email.', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: 'bk-date',  err: 'bk-err-date',  msg: 'Please select a date.' }
    ];
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const errEl = document.getElementById(f.err);
      const val = el.value.trim();
      if (!val || (f.pattern && !f.pattern.test(val))) {
        errEl.textContent = f.msg; el.classList.add('cf-invalid'); valid = false;
      } else {
        errEl.textContent = ''; el.classList.remove('cf-invalid');
      }
    });
    if (!valid) return;

    const sanitizeInput = str => str.replace(/[<>"'&]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','&':'&amp;'}[c]));
    const name     = sanitizeInput(document.getElementById('bk-name').value.trim());
    const phone    = sanitizeInput(document.getElementById('bk-phone').value.trim());
    const email    = sanitizeInput(document.getElementById('bk-email').value.trim());
    const property = sanitizeInput(document.getElementById('bk-property').value);
    const date     = sanitizeInput(document.getElementById('bk-date').value);
    const time     = sanitizeInput(document.getElementById('bk-time').value);
    const notes    = sanitizeInput(document.getElementById('bk-notes').value.trim() || 'None');

    const message = `Hello Toff Homes, I would like to book a site inspection.%0A%0A*Name:* ${encodeURIComponent(name)}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Email:* ${encodeURIComponent(email)}%0A*Property:* ${encodeURIComponent(property)}%0A*Date:* ${encodeURIComponent(date)}%0A*Time:* ${encodeURIComponent(time)}%0A*Notes:* ${encodeURIComponent(notes)}`;

    window.open(`https://wa.me/2348094442983?text=${message}`, '_blank');

    document.getElementById('bk-success').style.display = 'block';
    this.reset();
  });
