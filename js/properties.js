// Load first 3 properties from JSON into home page carousel
async function loadHomeProperties() {
  const carousel = document.getElementById('propCarousel');
  if (!carousel) return;
  try {
    const response = await fetch('./data/properties.json');
    const rawProperties = await response.json();
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const properties = rawProperties.map(p => ({
      ...p,
      images: p.images.map(img => isLocalhost && img.startsWith('/img/') ? '/real-estate' + img : img)
    }));
    const first3 = properties.slice(0, 3);
    carousel.innerHTML = '';
    first3.forEach(p => {
      const card = document.createElement('div');
      card.className = 'lw-dev-card';
      card.dataset.title = p.title;
      card.dataset.location = p.location;
      card.dataset.price = p.price;
      card.dataset.tags = p.tags.join(',');
      card.dataset.desc = p.description;
      card.dataset.imgs = p.images.join(',');
      if (p.pricingPlans) card.dataset.plans = JSON.stringify(p.pricingPlans);
      if (p.pricingPlans2) card.dataset.plans2 = JSON.stringify(p.pricingPlans2);
      card.innerHTML = `
        <img src="${p.images[0]}" alt="${p.title}" />
        ${p.featured ? '<div class="lw-dev-badge">FEATURED</div>' : ''}
        <div class="lw-dev-body">
          <p class="lw-dev-location">&#128205; ${p.location}</p>
          <h3>${p.title}</h3>
          <p class="lw-dev-desc">${p.description.replace(/<[^>]*>/g, '').substring(0, 120)}...</p>
          <div class="lw-dev-tags">${p.tags.slice(0, 4).map(t => `<span>${t}</span>`).join('')}</div>
          <div class="lw-dev-price-row">
            <div><p class="lw-dev-price-label">Starting From</p><p class="lw-dev-price">${p.price}</p></div>
          </div>
        </div>
        <button class="lw-btn-outline">View Details</button>
      `;
      card.addEventListener('click', e => {
        if (e.target.closest('.lw-card-btn') || !e.target.closest('.lw-dev-card')) return;
        openModal(card);
      });
      card.querySelector('.lw-btn-outline').addEventListener('click', e => {
        e.stopPropagation();
        openModal(card);
      });
      carousel.appendChild(card);
    });
  } catch (e) {
    console.error('Failed to load home properties:', e);
  }
}

// Modal elements
const modal = document.getElementById('propModal');
const modalClose = document.getElementById('propModalClose');
const modalImg = document.getElementById('propModalImg');
const dotsContainer = document.getElementById('propSlideDots');
let slideImgs = [], slideIndex = 0, autoSlideTimer = null;

function goToSlide(i) {
  if (!slideImgs.length) return;
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
  if (!modal) return;
  slideImgs = card.dataset.imgs.split(',').map(s => s.trim());
  slideIndex = 0;
  dotsContainer.innerHTML = slideImgs.map((_, i) => `<span class="prop-dot${i === 0 ? ' active' : ''}"></span>`).join('');
  dotsContainer.querySelectorAll('.prop-dot').forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAutoSlide(); }));
  modalImg.src = slideImgs[0];
  modalImg.alt = card.dataset.title;
  document.getElementById('propModalTitle').textContent = card.dataset.title;
  document.getElementById('propModalLocation').textContent = '📍 ' + card.dataset.location;
  document.getElementById('propModalDesc').innerHTML = card.dataset.desc;
  document.getElementById('propModalPrice').textContent = card.dataset.price;
  document.getElementById('propModalTags').innerHTML = card.dataset.tags.split(',').map(t => `<span>${t.trim()}</span>`).join('');

  const plansContainer = document.getElementById('propModalPlans');
  if (plansContainer) {
    const plans = card.dataset.plans;
    const plans2 = card.dataset.plans2;
    if (plans) {
      const buildTable = (data) => {
        const rows = JSON.parse(data).map(p =>
          `<tr><td>${p.plotSize}</td><td>${p.price}</td><td>${p.initialDeposit}</td><td>${p.paymentPlan}</td></tr>`
        ).join('');
        return `<table class="prop-plans-table"><thead><tr><th>Plot Size</th><th>Price</th><th>Initial Deposit</th><th>Payment Plan</th></tr></thead><tbody>${rows}</tbody></table>`;
      };
      let html = plans2
        ? `<p class="prop-plans-label">Phase 1</p>${buildTable(plans)}<p class="prop-plans-label" style="margin-top:14px">Phase 2</p>${buildTable(plans2)}`
        : buildTable(plans);
      plansContainer.innerHTML = html;
      plansContainer.style.display = 'block';
    } else {
      plansContainer.innerHTML = '';
      plansContainer.style.display = 'none';
    }
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  startAutoSlide();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  stopAutoSlide();
}

if (modal) {
  document.getElementById('propSlideNext').addEventListener('click', () => { goToSlide(slideIndex + 1); startAutoSlide(); });
  document.getElementById('propSlidePrev').addEventListener('click', () => { goToSlide(slideIndex - 1); startAutoSlide(); });

  document.querySelectorAll('.lw-card-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(btn.closest('.lw-dev-card')); });
  });

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

// Load home properties on page load
document.addEventListener('DOMContentLoaded', loadHomeProperties);
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
      const name     = document.getElementById('cf-name').value.trim();
      const email    = document.getElementById('cf-email').value.trim();
      const phone    = document.getElementById('cf-phone').value.trim();
      const property = document.getElementById('cf-property').value || 'Not specified';
      const message  = document.getElementById('cf-message').value.trim();

      const mailto = `mailto:rebecousin@gmail.com?subject=${encodeURIComponent('Enquiry about ' + property)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\nProperty of Interest: ' + property + '\n\nMessage:\n' + message)}`;

      window.location.href = mailto;

      this.reset();
      const s = document.getElementById('formSuccess');
      s.style.display = 'block';
      setTimeout(() => s.style.display = 'none', 5000);
    }
  });
}
