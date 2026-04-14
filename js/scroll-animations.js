// ── Hero entrance ──────────────────────────────────────────────
document.querySelectorAll('.lw-hero-tag, .lw-hero-content h1, .lw-hero-sub, .lw-hero-btns').forEach((el, i) => {
  el.style.cssText += `opacity:0;transform:translateY(28px);transition:opacity .7s ease ${i * 160}ms,transform .7s ease ${i * 160}ms`;
  requestAnimationFrame(() => setTimeout(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 80));
});

// ── Scroll-triggered animations ────────────────────────────────
const ANIM_CLASSES = {
  fade:        'anim-fade',
  slideLeft:   'anim-slide-left',
  slideRight:  'anim-slide-right',
  slideUp:     'anim-slide-up',
  scaleIn:     'anim-scale-in',
};

const css = `
.anim-fade        { opacity:0; transition:opacity .65s ease, transform .65s ease; }
.anim-slide-left  { opacity:0; transform:translateX(-40px); transition:opacity .65s ease, transform .65s ease; }
.anim-slide-right { opacity:0; transform:translateX(40px);  transition:opacity .65s ease, transform .65s ease; }
.anim-slide-up    { opacity:0; transform:translateY(36px);  transition:opacity .65s ease, transform .65s ease; }
.anim-scale-in    { opacity:0; transform:scale(.92);        transition:opacity .55s ease, transform .55s ease; }
.anim-visible     { opacity:1 !important; transform:none !important; }
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

function addAnim(selector, cls, stagger = 0) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add(cls);
    if (stagger) el.style.transitionDelay = `${i * stagger}ms`;
    observer.observe(el);
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('anim-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Section headers — animate each child individually with stagger
document.querySelectorAll('.lw-section-header, .lw-cta-content, .cf-panel-content').forEach(header => {
  const children = header.querySelectorAll('p, h2, h3');
  children.forEach((child, i) => {
    child.classList.add(ANIM_CLASSES.slideUp);
    child.style.transitionDelay = `${i * 120}ms`;
    observer.observe(child);
  });
});

// Stats — scale in with stagger
addAnim('.lw-stat', ANIM_CLASSES.scaleIn, 100);

// Property cards — slide up with stagger
addAnim('.lw-dev-card', ANIM_CLASSES.slideUp, 80);

// Why-invest steps — slide up with stagger
addAnim('.lw-why-step', ANIM_CLASSES.slideUp, 90);

// Process steps — slide up stagger
addAnim('.lw-step', ANIM_CLASSES.slideUp, 110);

// Testimonial cards — fade with stagger
addAnim('.lw-testi-card', ANIM_CLASSES.fade, 120);

// Why-invest cards (invest page)
addAnim('.lw-why-card', ANIM_CLASSES.slideUp, 90);

// About page cards
addAnim('.ab-mv-card, .ab-val-card', ANIM_CLASSES.scaleIn, 100);
addAnim('.ab-team-card', ANIM_CLASSES.slideUp, 100);
addAnim('.ab-intro-text', ANIM_CLASSES.slideLeft);
addAnim('.ab-intro-img', ANIM_CLASSES.slideRight);

// Contact form panels
addAnim('.cf-form-panel', ANIM_CLASSES.slideRight);

// ── Counter animation ──────────────────────────────────────────
function runCounter(el) {
  const raw    = el.dataset.target;
  const target = parseFloat(raw);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const isFloat = raw.includes('.');
  const steps = 50, duration = 1600;
  let current = 0;
  const inc = target / steps;
  const timer = setInterval(() => {
    current += inc;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
  }, duration / steps);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      runCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.lw-stat-num[data-target]').forEach(el => counterObserver.observe(el));

// ── Navbar scroll shrink ───────────────────────────────────────
const header = document.querySelector('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('header-scrolled', window.scrollY > 40);
  }, { passive: true });
}
