// Carousel
const carousel = document.getElementById('propCarousel');
const cardWidth = () => carousel.querySelector('.lw-dev-card').offsetWidth + 28;
document.querySelector('.carousel-btn--next').addEventListener('click', () => carousel.scrollBy({ left: cardWidth(), behavior: 'smooth' }));
document.querySelector('.carousel-btn--prev').addEventListener('click', () => carousel.scrollBy({ left: -cardWidth(), behavior: 'smooth' }));

// Touch/drag swipe
let startX = 0, isDragging = false;
carousel.addEventListener('mousedown', e => { isDragging = true; startX = e.pageX; carousel.style.cursor = 'grabbing'; });
carousel.addEventListener('mousemove', e => { if (!isDragging) return; carousel.scrollLeft -= e.movementX; });
carousel.addEventListener('mouseup', () => { isDragging = false; carousel.style.cursor = 'grab'; });
carousel.addEventListener('mouseleave', () => { isDragging = false; carousel.style.cursor = 'grab'; });
carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
carousel.addEventListener('touchmove', e => { carousel.scrollLeft -= e.touches[0].clientX - startX; startX = e.touches[0].clientX; }, { passive: true });

// Property modal slideshow
const modal = document.getElementById('propModal');
const modalClose = document.getElementById('propModalClose');
const modalImg = document.getElementById('propModalImg');
const dotsContainer = document.getElementById('propSlideDots');
let slideImgs = [], slideIndex = 0, autoSlideTimer = null;

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

document.getElementById('propSlideNext').addEventListener('click', () => { goToSlide(slideIndex + 1); startAutoSlide(); });
document.getElementById('propSlidePrev').addEventListener('click', () => { goToSlide(slideIndex - 1); startAutoSlide(); });

document.querySelectorAll('.lw-dev-card').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('.lw-card-btn') || !e.target.closest('.lw-dev-card')) return;
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
  });
});

document.querySelectorAll('.lw-card-btn').forEach(btn => {
  btn.addEventListener('click', e => { e.stopPropagation(); btn.closest('.lw-dev-card').click(); });
});

function closeModal() { modal.classList.remove('active'); document.body.style.overflow = ''; stopAutoSlide(); }
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') goToSlide(slideIndex + 1);
  if (e.key === 'ArrowLeft') goToSlide(slideIndex - 1);
});

// Contact form validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
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
      this.reset();
      const s = document.getElementById('formSuccess');
      s.style.display = 'block';
      setTimeout(() => s.style.display = 'none', 5000);
    }
  });
}
