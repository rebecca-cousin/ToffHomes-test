const properties = [
  {
    id: 1,
    title: "Modern Family Home",
    location: "Lagos, Nigeria",
    type: "house",
    price: 150000000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80"
  },
  {
    id: 2,
    title: "Downtown Luxury Apartment",
    location: "Abuja, Nigeria",
    type: "apartment",
    price: 120000000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"
  },
  {
    id: 3,
    title: "Beachfront Villa",
    location: "Port Harcourt, Nigeria",
    type: "villa",
    price: 300000000,
    beds: 5,
    baths: 4,
    sqft: 4200,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80"
  },
  {
    id: 4,
    title: "Cozy City Condo",
    location: "Kano, Nigeria",
    type: "condo",
    price: 80000000,
    beds: 1,
    baths: 1,
    sqft: 750,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
  },
  {
    id: 5,
    title: "Suburban Ranch House",
    location: "Ibadan, Nigeria",
    type: "house",
    price: 100000000,
    beds: 3,
    baths: 2,
    sqft: 1900,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80"
  },
  {
    id: 6,
    title: "Penthouse Suite",
    location: "Lagos, Nigeria",
    type: "apartment",
    price: 250000000,
    beds: 3,
    baths: 3,
    sqft: 2100,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80"
  },
  {
    id: 7,
    title: "Lakeside Retreat",
    location: "Abuja, Nigeria",
    type: "villa",
    price: 220000000,
    beds: 4,
    baths: 3,
    sqft: 3100,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"
  },
  {
    id: 8,
    title: "Studio Condo Downtown",
    location: "Enugu, Nigeria",
    type: "condo",
    price: 60000000,
    beds: 1,
    baths: 1,
    sqft: 520,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80"
  },
  {
    id: 9,
    title: "Classic Colonial Home",
    location: "Benin City, Nigeria",
    type: "house",
    price: 95000000,
    beds: 3,
    baths: 2,
    sqft: 2000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
  }
];

function formatPrice(price) {
  return "₦" + price.toLocaleString();
}

function createCard(property) {
  return `
    <div class="card">
      <img class="card-img" src="${property.image}" alt="${property.title}" loading="lazy" />
      <div class="card-body">
        <span class="card-badge">${property.type}</span>
        <h3>${property.title}</h3>
        <p class="card-location">📍 ${property.location}</p>
        <p class="card-price">${formatPrice(property.price)}</p>
        <div class="card-features">
          <span>🛏 ${property.beds} Beds</span>
          <span>🚿 ${property.baths} Baths</span>
          <span>📐 ${property.sqft.toLocaleString()} sqft</span>
        </div>
        <a href="#" class="btn-view">View Property</a>
      </div>
    </div>
  `;
}

function filterProperties() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const type    = document.getElementById("typeFilter").value;
  const maxPrice = document.getElementById("priceFilter").value;
  const minBeds  = document.getElementById("bedsFilter").value;

  const filtered = properties.filter(p => {
    const matchesKeyword = p.title.toLowerCase().includes(keyword) ||
                           p.location.toLowerCase().includes(keyword) ||
                           p.type.toLowerCase().includes(keyword);
    const matchesType  = !type     || p.type === type;
    const matchesPrice = !maxPrice || p.price <= parseInt(maxPrice);
    const matchesBeds  = !minBeds  || p.beds >= parseInt(minBeds);

    return matchesKeyword && matchesType && matchesPrice && matchesBeds;
  });

  renderListings(filtered);
}

function renderListings(list) {
  const grid     = document.getElementById("listingsGrid");
  const noResult = document.getElementById("noResults");
  const count    = document.getElementById("resultsCount");

  if (list.length === 0) {
    grid.innerHTML = "";
    noResult.style.display = "block";
    count.textContent = "";
  } else {
    noResult.style.display = "none";
    grid.innerHTML = list.map(createCard).join("");
    count.textContent = `Showing ${list.length} propert${list.length === 1 ? "y" : "ies"}`;
  }
}

// Live search on keyup
document.getElementById("searchInput").addEventListener("keyup", filterProperties);

// Initial render
renderListings(properties);
