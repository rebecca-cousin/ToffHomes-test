// Modal elements
const modal = document.getElementById('propModal');
const modalClose = document.getElementById('propModalClose');
const modalImg = document.getElementById('propModalImg');
const dotsContainer = document.getElementById('propSlideDots');
let slideImgs = [], slideIndex = 0, autoSlideTimer = null;

if (modal) {
  function goToSlide(i) {
    slideIndex = (i + slideImgs.length) % slideImgs.length;
    modalImg.src = slideImgs[slideIndex];
    dotsContainer.querySelectorAll('.prop-dot').forEach((d, idx) => d.classList.toggle('active', idx === slideIndex));
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => goToSlide(slideIndex + 1), 3000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) { clearInterval(autoSlideTimer); autoSlideTimer = null; }
  }

  function openModal(card) {
    slideImgs = card.dataset.imgs.split(',').map(s => s.trim());
    slideIndex = 0;
    dotsContainer.innerHTML = slideImgs.map((_, i) => `<span class="prop-dot${i === 0 ? ' active' : ''}"></span>`).join('');
    dotsContainer.querySelectorAll('.prop-dot').forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAutoSlide(); }));
    modalImg.src = slideImgs[0];
    modalImg.alt = card.dataset.title;
    document.getElementById('propModalTitle').textContent = card.dataset.title;
    document.getElementById('propModalLocation').textContent = '📍 ' + card.dataset.location;
    document.getElementById('propModalDesc').textContent = card.dataset.desc;
    document.getElementById('propModalPrice').textContent = card.dataset.price;
    document.getElementById('propModalTags').innerHTML = card.dataset.tags.split(',').map(t => `<span>${t.trim()}</span>`).join('');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    startAutoSlide();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    stopAutoSlide();
  }

  document.getElementById('propSlideNext').addEventListener('click', () => { goToSlide(slideIndex + 1); startAutoSlide(); });
  document.getElementById('propSlidePrev').addEventListener('click', () => { goToSlide(slideIndex - 1); startAutoSlide(); });

  // Index page cards
  document.querySelectorAll('.lw-dev-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.lw-card-btn') || !e.target.closest('.lw-dev-card')) return;
      openModal(card);
    });
  });

  document.querySelectorAll('.lw-card-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(btn.closest('.lw-dev-card')); });
  });

  // Property page community cards and listing cards - event delegation
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-view');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const parentCard = btn.closest('.community-card') || btn.closest('.card');
      if (parentCard) openModal(parentCard);
      return;
    }
    const communityCard = e.target.closest('.community-card');
    if (communityCard) openModal(communityCard);
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') goToSlide(slideIndex + 1);
    if (e.key === 'ArrowLeft') goToSlide(slideIndex - 1);
  });
}

// Contact form validation + EmailJS
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  emailjs.init('YOUR_PUBLIC_KEY');

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;
    const fields = [
      { id: 'cf-name',    err: 'err-name',    msg: 'Please enter your full name.' },
      { id: 'cf-email',   err: 'err-email',   msg: 'Please enter a valid email.',  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: 'cf-phone',   err: 'err-phone',   msg: 'Please enter your phone number.' },
      { id: 'cf-message', err: 'err-message', msg: 'Please enter a message.' }
    ];
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const errEl = document.getElementById(f.err);
      const val = el.value.trim();
      if (!val || (f.pattern && !f.pattern.test(val))) {
        errEl.textContent = f.msg;
        el.classList.add('cf-invalid');
        valid = false;
      } else {
        errEl.textContent = '';
        el.classList.remove('cf-invalid');
      }
    });

    if (valid) {
      const submitBtn = contactForm.querySelector('.cf-submit');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const templateParams = {
        name:     document.getElementById('cf-name').value.trim(),
        email:    document.getElementById('cf-email').value.trim(),
        phone:    document.getElementById('cf-phone').value.trim(),
        property: document.getElementById('cf-property').value || 'Not specified',
        message:  document.getElementById('cf-message').value.trim()
      };

      emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(() => {
          this.reset();
          const s = document.getElementById('formSuccess');
          s.style.display = 'block';
          setTimeout(() => s.style.display = 'none', 5000);
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;
        })
        .catch(() => {
          alert('Failed to send message. Please try again or call us directly.');
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;
        });
    }
  });
}
