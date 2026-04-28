// Dynamic Property Loader
class PropertyManager {
  constructor() {
    this.properties = [];
    this.filteredProperties = [];
    this.currentSlideIndex = 0;
    this.currentImages = [];
  }

  async loadProperties() {
    try {
      console.log('Loading properties from:', '../data/properties.json');
      const response = await fetch('../data/properties.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.properties = await response.json();
      console.log('Properties loaded:', this.properties);
      this.filteredProperties = [...this.properties];
      this.renderProperties();
      this.updateResultsCount();
    } catch (error) {
      console.error('Error loading properties:', error);
      this.showFallbackProperties();
    }
  }

  showFallbackProperties() {
    // Fallback to existing hardcoded properties if JSON fails to load
    const existingCards = document.querySelectorAll('.community-card');
    if (existingCards.length > 0) {
      console.log('Using existing hardcoded properties as fallback');
      return;
    }
  }

  renderProperties() {
    const container = document.querySelector('.community-grid');
    console.log('Container found:', container);
    if (!container) {
      console.error('Community grid container not found!');
      return;
    }

    container.innerHTML = '';
    console.log('Rendering', this.filteredProperties.length, 'properties');

    this.filteredProperties.forEach(property => {
      console.log('Creating card for:', property.title, 'with images:', property.images);
      const card = this.createPropertyCard(property);
      container.appendChild(card);
    });

    this.attachEventListeners();
  }

  createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'community-card';
    card.setAttribute('data-title', property.title);
    card.setAttribute('data-location', property.location);
    card.setAttribute('data-price', property.price);
    card.setAttribute('data-tags', property.tags.join(','));
    card.setAttribute('data-desc', property.description);
    card.setAttribute('data-imgs', property.images.join(','));

    console.log('Creating card with image:', property.images[0]);

    card.innerHTML = `
      ${property.featured ? '<div class="lw-dev-badge">FEATURED</div>' : ''}
      <img src="${property.images[0]}" alt="${property.title}" onerror="console.error('Image failed to load:', this.src)" onload="console.log('Image loaded successfully:', this.src)" />
      <div class="community-body">
        <h3>${property.title}</h3>
        <p>Location: ${property.location}</p>
        <p>${property.documentation}</p>
        <div class="features">
          ${property.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
        <a href="javascript:void(0)" class="btn-view">View Details</a>
      </div>
    `;

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

    document.getElementById('propModalTitle').textContent = title;
    document.getElementById('propModalLocation').textContent = location;
    document.getElementById('propModalPrice').textContent = price;
    document.getElementById('propModalDesc').textContent = description;

    const tagsContainer = document.getElementById('propModalTags');
    tagsContainer.innerHTML = tags.map(tag => `<span>${tag.trim()}</span>`).join('');

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
                        (docFilter === 'coo' && property.documentation.toLowerCase().includes('occupancy'));

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
});

// Global function for filtering (called from HTML)
function filterProperties() {
  propertyManager.filterProperties();
}