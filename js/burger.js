const burgerButton = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = mobileMenu.querySelectorAll(
  '.mobile-menu__link, .mobile-menu__menu-link'
);

let isMenuOpen = false;

function openMenu() {
  isMenuOpen = true;
  burgerButton.setAttribute('aria-expanded', 'true');
  burgerButton.classList.add('is-open');
  mobileMenu.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  isMenuOpen = false;
  burgerButton.setAttribute('aria-expanded', 'false');
  burgerButton.classList.remove('is-open');
  mobileMenu.classList.remove('is-open');
  document.body.style.overflow = '';
}

function toggleMenu() {
  if (isMenuOpen) closeMenu();
  else openMenu();
}

function setupBurger() {
  burgerButton.addEventListener('click', toggleMenu);
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen) closeMenu();
  });

  window.addEventListener('resize', () => {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;
    if (isDesktop && isMenuOpen) closeMenu();
  });
}

setupBurger();