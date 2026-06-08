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

  async loadProperties() {
    try {
      const response = await fetch('../data/properties.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.properties = await response.json();
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        this.properties = this.properties.map(p => ({
          ...p,
          images: p.images.map(img => img.startsWith('/assets/img/') ? '/real-estate' + img : img)
        }));
      }
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
    card.setAttribute('data-title', sanitize(property.title));
    card.setAttribute('data-location', sanitize(property.location));
    card.setAttribute('data-price', sanitize(property.price));
    card.setAttribute('data-tags', property.tags.map(t => sanitize(t)).join(','));
    card.setAttribute('data-desc', sanitize(property.description));
    card.setAttribute('data-imgs', property.images.map(i => sanitize(i)).join(','));
    if (property.pricingPlans) card.setAttribute('data-plans', JSON.stringify(property.pricingPlans));
    if (property.pricingPlans2) card.setAttribute('data-plans2', JSON.stringify(property.pricingPlans2));

    if (property.featured) {
      const badge = document.createElement('div');
      badge.className = 'lw-dev-badge';
      badge.textContent = 'FEATURED';
      card.appendChild(badge);
    }

    const img = document.createElement('img');
    img.src = sanitize(property.images[0]);
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
    const title = card.getAttribute('data-title');
    const location = card.getAttribute('data-location');
    const price = card.getAttribute('data-price');
    const description = card.getAttribute('data-desc');
    const tags = card.getAttribute('data-tags').split(',');
    const images = card.getAttribute('data-imgs').split(',');
    const plans = card.getAttribute('data-plans');

    document.getElementById('propModalTitle').textContent = title;
    document.getElementById('propModalLocation').textContent = location;
    document.getElementById('propModalPrice').textContent = price;
    document.getElementById('propModalDesc').textContent = description;

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

    this.currentImages = images;
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

  filterProperties() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value.toLowerCase();
    const priceFilter = parseInt(document.getElementById('priceFilter').value) || Infinity;
    const docFilter = document.getElementById('bedsFilter').value.toLowerCase();

    this.filteredProperties = this.properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm) ||
                           property.location.toLowerCase().includes(searchTerm);
      
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