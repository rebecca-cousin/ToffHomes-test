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
  link.addEventListener('click', closeMenu);
});
