const STORAGE_KEY = 'theme';
const root = document.documentElement;
const buttons = document.querySelectorAll('.theme-switch__btn');

function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }

  buttons.forEach((btn) => {
    const isActive = btn.dataset.themeValue === theme;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
applyTheme(savedTheme);

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.themeValue;
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  });
});
