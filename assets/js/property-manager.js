// Dynamic Property Loader
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

class PropertyManager {
  constructor() {
    this.properties = [];
    this.filteredProperties = [];
    this.currentSlideIndex = 0;
    this.currentImages = [];
  }

  normalizeImagePath(path) {
    if (!path) return '';
    if (path.startsWith('/assets/')) {
      return `..${path}`;
    }
    return path;
  }

  async loadProperties() {
    try {
      const response = await fetch('../data/properties.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.properties = await response.json();

      this.filteredProperties = [...this.properties];
      this.renderProperties();
      this.updateResultsCount();
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  renderProperties() {
    const container = document.querySelector('.community-grid');
    if (!container) return;
    container.innerHTML = '';
    this.filteredProperties.forEach(property => {
      const card = this.createPropertyCard(property);
      container.appendChild(card);
    });
    this.attachEventListeners();
  }

  createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'community-card';
    card.dataset.propertyId = property.id;
    card.setAttribute('data-title', sanitize(property.title));
    card.setAttribute('data-location', sanitize(property.location));
    card.setAttribute('data-price', sanitize(property.price));
    card.setAttribute('data-tags', property.tags.map(t => sanitize(t)).join(','));
    if (property.pricingPlans) card.setAttribute('data-plans', JSON.stringify(property.pricingPlans));
    if (property.pricingPlans2) card.setAttribute('data-plans2', JSON.stringify(property.pricingPlans2));

    if (property.featured) {
      const badge = document.createElement('div');
      badge.className = 'lw-dev-badge';
      badge.textContent = 'FEATURED';
      card.appendChild(badge);
    }

    const img = document.createElement('img');
    img.src = this.normalizeImagePath(property.images[0]);
    img.alt = sanitize(property.title);
    img.loading = 'lazy';
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'community-body';

    const title = document.createElement('h3');
    title.textContent = property.title;
    body.appendChild(title);

    const loc = document.createElement('p');
    loc.textContent = 'Location: ' + property.location;
    body.appendChild(loc);

    const doc = document.createElement('p');
    doc.textContent = property.documentation;
    body.appendChild(doc);

    const features = document.createElement('div');
    features.className = 'features';
    property.tags.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      features.appendChild(span);
    });
    body.appendChild(features);

    const btn = document.createElement('a');
    btn.href = 'javascript:void(0)';
    btn.className = 'btn-view';
    btn.textContent = 'View Details';
    body.appendChild(btn);

    card.appendChild(body);
    return card;
  }

  attachEventListeners() {
    const viewButtons = document.querySelectorAll('.btn-view');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.community-card');
        this.openModal(card);
      });
    });
  }

  openModal(card) {
    const modal = document.getElementById('propModal');
    const propertyId = parseInt(card.dataset.propertyId, 10);
    const property = this.properties.find(p => p.id === propertyId) || this.filteredProperties.find(p => p.id === propertyId);
    if (!property) return;

    document.getElementById('propModalTitle').textContent = property.title;
    document.getElementById('propModalLocation').textContent = property.location;
    document.getElementById('propModalPrice').textContent = property.price;
    document.getElementById('propModalDesc').innerHTML = property.description;
    const tags = property.tags;
    const images = property.images || [];
    const plans = card.getAttribute('data-plans');

    const tagsContainer = document.getElementById('propModalTags');
    tagsContainer.innerHTML = tags.map(tag => `<span>${sanitize(tag.trim())}</span>`).join('');

    const plans2 = card.getAttribute('data-plans2');
    const plansContainer = document.getElementById('propModalPlans');
    if (plansContainer) {
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

    this.currentImages = images.map(img => this.normalizeImagePath(img));
    this.currentSlideIndex = 0;
    this.updateModalImage();
    this.createSlideDots();

    modal.classList.add('active');
  }

  updateModalImage() {
    const img = document.getElementById('propModalImg');
    img.src = this.currentImages[this.currentSlideIndex];
  }

  createSlideDots() {
    const dotsContainer = document.getElementById('propSlideDots');
    dotsContainer.innerHTML = '';

    this.currentImages.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `prop-dot ${index === this.currentSlideIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        this.currentSlideIndex = index;
        this.updateModalImage();
        this.updateDots();
      });
      dotsContainer.appendChild(dot);
    });
  }

  updateDots() {
    const dots = document.querySelectorAll('.prop-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlideIndex);
    });
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.currentImages.length;
    this.updateModalImage();
    this.updateDots();
  }

  prevSlide() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.currentImages.length) % this.currentImages.length;
    this.updateModalImage();
    this.updateDots();
  }

  parsePriceSearchTerm(term) {
    if (!term) return null;
    const cleanTerm = term.toLowerCase().trim();
    const digits = cleanTerm.replace(/[^0-9]/g, '');
    if (!digits) return null;
    let value = parseInt(digits, 10);
    if (/m\b|million/.test(cleanTerm)) {
      value *= 1000000;
    } else if (/k\b|thousand/.test(cleanTerm)) {
      value *= 1000;
    }
    return value;
  }

  filterProperties() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const priceSearchValue = this.parsePriceSearchTerm(searchTerm);
    const typeFilter = document.getElementById('typeFilter').value.toLowerCase();
    const priceFilter = parseInt(document.getElementById('priceFilter').value) || Infinity;
    const docFilter = document.getElementById('bedsFilter').value.toLowerCase();

    this.filteredProperties = this.properties.filter(property => {
      const normalizedPropertyPrice = property.price.toLowerCase().replace(/[^0-9]/g, '');
      const normalizedSearchDigits = searchTerm.replace(/[^0-9]/g, '');
      const matchesSearch = property.title.toLowerCase().includes(searchTerm) ||
                           property.location.toLowerCase().includes(searchTerm) ||
                           property.price.toLowerCase().includes(searchTerm) ||
                           (normalizedSearchDigits && normalizedPropertyPrice.includes(normalizedSearchDigits)) ||
                           (priceSearchValue && property.priceValue === priceSearchValue);
      
      const matchesType = !typeFilter || property.category === typeFilter;
      
      const matchesPrice = property.priceValue <= priceFilter;
      
      const matchesDoc = !docFilter || 
                        (docFilter === 'excision' && property.documentation.toLowerCase().includes('excision')) ||
                        (docFilter === 'coo' && property.documentation.toLowerCase().includes('occupancy')) ||
                        (docFilter === 'survey' && property.documentation.toLowerCase().includes('survey'));

      return matchesSearch && matchesType && matchesPrice && matchesDoc;
    });

    this.renderProperties();
    this.updateResultsCount();
    this.toggleNoResults();
  }

  updateResultsCount() {
    const count = this.filteredProperties.length;
    const resultsElement = document.getElementById('resultsCount');
    if (resultsElement) {
      resultsElement.textContent = `${count} estate${count !== 1 ? 's' : ''} found`;
    }
  }

  toggleNoResults() {
    const noResults = document.getElementById('noResults');
    if (noResults) {
      noResults.style.display = this.filteredProperties.length === 0 ? 'block' : 'none';
    }
  }

  initializeModalControls() {
    const modal = document.getElementById('propModal');
    const closeBtn = document.getElementById('propModalClose');
    const prevBtn = document.getElementById('propSlidePrev');
    const nextBtn = document.getElementById('propSlideNext');

    closeBtn?.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    prevBtn?.addEventListener('click', () => this.prevSlide());
    nextBtn?.addEventListener('click', () => this.nextSlide());
  }
}

// Initialize the property manager
const propertyManager = new PropertyManager();

// Load properties when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  propertyManager.loadProperties();
  propertyManager.initializeModalControls();

  // Auto-filter if search query in URL
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  if (search) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = search.replace(/[<>"'&]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','&':'&amp;'}[c]));
      setTimeout(() => filterProperties(), 500);
    }
  }
});

// Global function for filtering (called from HTML)
function filterProperties() {
  propertyManager.filterProperties();
  const hasFilter = document.getElementById('searchInput').value ||
    document.getElementById('typeFilter').value ||
    document.getElementById('priceFilter').value ||
    document.getElementById('bedsFilter').value;
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) clearBtn.style.display = hasFilter ? 'inline-flex' : 'none';
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('typeFilter').value = '';
  document.getElementById('priceFilter').value = '';
  document.getElementById('bedsFilter').value = '';
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) clearBtn.style.display = 'none';
  propertyManager.filterProperties();
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', filterProperties);
});

// ── Booking Modal ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const bkDate = document.getElementById('bk-date');
  if (bkDate) bkDate.min = new Date().toISOString().split('T')[0];

  const bookingClose = document.getElementById('bookingClose');
  const bookingModal = document.getElementById('bookingModal');

  if (bookingClose) {
    bookingClose.addEventListener('click', () => {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', e => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
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
  }
});

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
