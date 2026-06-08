const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const backdrop = document.getElementById('navBackdrop');

function closeMenu() {
  hamburger.classList.remove('active');
  nav.classList.remove('nav-open');
  backdrop.classList.remove('active');
}

hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('nav-open');
  hamburger.classList.toggle('active');
  backdrop.classList.toggle('active', isOpen);
});

backdrop.addEventListener('click', closeMenu);

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      closeMenu();
      const target = document.querySelector(href);
      if (target) {
        setTimeout(() => {
          const offset = document.querySelector('header').offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 300);
      }
    } else {
      closeMenu();
    }
  });
});
