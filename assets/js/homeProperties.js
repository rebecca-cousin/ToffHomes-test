function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeInput(str) {
  return str.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }[c]));
}
async function loadHomeProperties() {
  const carousel = document.getElementById('propCarousel');
  if (!carousel) return;
  try {
    // Show skeletons while fetching
    carousel.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const sk = document.createElement('div');
      sk.className = 'lw-dev-card lw-skeleton';
      sk.innerHTML = '<div class="sk-img"></div><div class="sk-body"><div class="sk-line sk-line--title"></div><div class="sk-line"></div><div class="sk-line sk-line--short"></div></div>';
      carousel.appendChild(sk);
    }
    const response = await fetch('./data/properties.json');
    const rawProperties = await response.json();
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const properties = rawProperties.map(p => ({
      ...p,
      images: p.images.map(img => isLocalhost && img.startsWith('/assets/img/') ? '/real-estate' + img : img)
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

      const img = document.createElement('img');
      img.src = p.images[0];
      img.alt = p.title;
      img.loading = 'lazy';
      card.appendChild(img);

      if (p.featured) {
        const badge = document.createElement('div');
        badge.className = 'lw-dev-badge';
        badge.textContent = 'FEATURED';
        card.appendChild(badge);
      }

      const body = document.createElement('div');
      body.className = 'lw-dev-body';

      const loc = document.createElement('p');
      loc.className = 'lw-dev-location';
      loc.textContent = '📍 ' + p.location;
      body.appendChild(loc);

      const title = document.createElement('h3');
      title.textContent = p.title;
      body.appendChild(title);

      const desc = document.createElement('p');
      desc.className = 'lw-dev-desc';
      desc.textContent = p.description.replace(/<[^>]*>/g, '').substring(0, 90) + '...';
      body.appendChild(desc);

      const tags = document.createElement('div');
      tags.className = 'lw-dev-tags';
      p.tags.slice(0, 4).forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        tags.appendChild(span);
      });
      body.appendChild(tags);

      const priceRow = document.createElement('div');
      priceRow.className = 'lw-dev-price-row';
      const priceDiv = document.createElement('div');
      const priceLabel = document.createElement('p');
      priceLabel.className = 'lw-dev-price-label';
      priceLabel.textContent = 'Starting From';
      const priceVal = document.createElement('p');
      priceVal.className = 'lw-dev-price';
      priceVal.textContent = p.price;
      priceDiv.appendChild(priceLabel);
      priceDiv.appendChild(priceVal);
      priceRow.appendChild(priceDiv);
      body.appendChild(priceRow);
      card.appendChild(body);

      const btn = document.createElement('button');
      btn.className = 'lw-btn-outline';
      btn.textContent = 'View Details';
      card.appendChild(btn);

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
  document.getElementById('propModalDesc').textContent = card.dataset.desc;
  document.getElementById('propModalPrice').textContent = card.dataset.price;
  document.getElementById('propModalTags').innerHTML = '';
  const tagsContainer = document.getElementById('propModalTags');
  card.dataset.tags.split(',').forEach(t => {
    const span = document.createElement('span');
    span.textContent = t.trim();
    tagsContainer.appendChild(span);
  });

  const plansContainer = document.getElementById('propModalPlans');
  if (plansContainer) {
    const plans = card.dataset.plans;
    const plans2 = card.dataset.plans2;
    if (plans) {
      const buildTable = (data) => {
        const rows = JSON.parse(data).map(p =>
          `<tr><td>${sanitize(String(p.plotSize))}</td><td>${sanitize(String(p.price))}</td><td>${sanitize(String(p.initialDeposit))}</td><td>${sanitize(String(p.paymentPlan))}</td></tr>`
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
    // Honeypot check
    if (this.querySelector('input[name="website"]') && this.querySelector('input[name="website"]').value) return;
    let valid = true;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
    const fields = [
      { id: 'cf-name',    err: 'err-name',    msg: 'Please enter your full name.' },
      { id: 'cf-email',   err: 'err-email',   msg: 'Please enter a valid email.',  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: 'cf-phone',   err: 'err-phone',   msg: 'Please enter a valid phone number.', pattern: phoneRegex },
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

      const mailto = `mailto:hello@toffhomes.com?subject=${encodeURIComponent('Enquiry about ' + property)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\nProperty of Interest: ' + property + '\n\nMessage:\n' + message)}`;

      window.location.href = mailto;

      this.reset();
      const s = document.getElementById('formSuccess');
      s.style.display = 'block';
      setTimeout(() => s.style.display = 'none', 5000);
    }
  });
}
