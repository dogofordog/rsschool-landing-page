// js/catalog.js

// ============================================================
// Состояние приложения
// ============================================================
const state = {
  products: [],
  activeCategory: 'coffee',
  showAll: false,
  modal: {
    product: null,       // открытый товар
    sizeKey: 's',        // активный размер
    additives: [],       // массив индексов выбранных добавок
  },
};

// ============================================================
// DOM-элементы
// ============================================================
const grid = document.querySelector('.menu__grid');
const tabs = document.querySelectorAll('.menu__tab');
const moreButton = document.querySelector('.menu__more');
const cardTemplate = document.getElementById('card-template');

const modal = document.getElementById('modal');
const modalImage = modal.querySelector('.modal__image');
const modalTitle = modal.querySelector('.modal__title');
const modalDescription = modal.querySelector('.modal__description');
const modalSizesBox = modal.querySelector('[data-modal-sizes]');
const modalAdditivesBox = modal.querySelector('[data-modal-additives]');
const modalTotal = modal.querySelector('[data-modal-total]');
const modalCloseEls = modal.querySelectorAll('[data-modal-close]');

const IMG_PATH = 'assets/img/';
const INITIAL_MOBILE_COUNT = 4;

// ============================================================
// Загрузка данных
// ============================================================
async function loadProducts() {
  const response = await fetch('js/products.json');
  if (!response.ok) {
    throw new Error(`Не удалось загрузить products.json: ${response.status}`);
  }
  return response.json();
}

// ============================================================
// Создание карточки
// ============================================================
function createCard(product) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.card');

  card.querySelector('.card__img').src = IMG_PATH + product.image;
  card.querySelector('.card__img').alt = product.name;
  card.querySelector('.card__title').textContent = product.name;
  card.querySelector('.card__text').textContent = product.description;
  card.querySelector('.card__price').textContent = '$' + product.price;

  card.dataset.name = product.name;
  return fragment;
}

// ============================================================
// Рендер карточек
// ============================================================
function renderCards() {
  const filtered = state.products.filter(
    (product) => product.category === state.activeCategory
  );

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  let visible = filtered;
  if (isMobile && !state.showAll && filtered.length > INITIAL_MOBILE_COUNT) {
    visible = filtered.slice(0, INITIAL_MOBILE_COUNT);
  }

  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  visible.forEach((product) => fragment.appendChild(createCard(product)));
  grid.appendChild(fragment);

  const hasMore = isMobile && !state.showAll && filtered.length > INITIAL_MOBILE_COUNT;
  moreButton.hidden = !hasMore;
}

// ============================================================
// Категории
// ============================================================
function setupTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      state.activeCategory = tab.dataset.category;
      state.showAll = false;
      renderCards();
    });
  });
}

// ============================================================
// Show more
// ============================================================
function setupMoreButton() {
  moreButton.addEventListener('click', () => {
    state.showAll = true;
    renderCards();
  });
}

// ============================================================
// Реакция на resize
// ============================================================
function setupResize() {
  window.addEventListener('resize', () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) state.showAll = false;
    renderCards();
  });
}

// ============================================================
// МОДАЛЬНОЕ ОКНО
// ============================================================

// Открывает модалку для товара по имени
function openModal(productName) {
  const product = state.products.find((p) => p.name === productName);
  if (!product) return;

  // Сбрасываем состояние модалки: размер — первый, добавки — пусто
  state.modal.product = product;
  state.modal.sizeKey = 's';
  state.modal.additives = [];

  // Заполняем базовую информацию
  modalImage.src = IMG_PATH + product.image;
  modalImage.alt = product.name;
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.description;

  renderSizes();
  renderAdditives();
  updateTotal();

  modal.hidden = false;
  document.body.style.overflow = 'hidden'; // блокируем скролл страницы
}

// Закрывает модалку
function closeModal() {
  modal.hidden = true;
  state.modal.product = null;
  document.body.style.overflow = ''; // возвращаем скролл
}

// Рендерит кнопки размеров
function renderSizes() {
  const product = state.modal.product;
  modalSizesBox.innerHTML = '';

  // Object.entries перебирает ключи и значения объекта sizes
  Object.entries(product.sizes).forEach(([key, data]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'modal__option';
    if (key === state.modal.sizeKey) button.classList.add('is-active');
    button.dataset.sizeKey = key;

    button.innerHTML = `
      <span class="modal__option-badge">${key.toUpperCase()}</span>
      <span class="modal__option-label">${data.size}</span>
    `;

    button.addEventListener('click', () => {
      state.modal.sizeKey = key;
      // Переключаем активный класс
      modalSizesBox.querySelectorAll('.modal__option').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.sizeKey === key);
      });
      updateTotal();
    });

    modalSizesBox.appendChild(button);
  });
}

// Рендерит кнопки добавок
function renderAdditives() {
  const product = state.modal.product;
  modalAdditivesBox.innerHTML = '';

  product.additives.forEach((additive, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'modal__option';
    button.dataset.additiveIndex = index;

    button.innerHTML = `
      <span class="modal__option-badge">${index + 1}</span>
      <span class="modal__option-label">${additive.name}</span>
    `;

    button.addEventListener('click', () => {
      // toggle: если уже есть в массиве — убираем, если нет — добавляем
      const idx = state.modal.additives.indexOf(index);
      if (idx === -1) {
        state.modal.additives.push(index);
        button.classList.add('is-active');
      } else {
        state.modal.additives.splice(idx, 1);
        button.classList.remove('is-active');
      }
      updateTotal();
    });

    modalAdditivesBox.appendChild(button);
  });
}

// Пересчитывает и обновляет итоговую цену
function updateTotal() {
  const product = state.modal.product;
  if (!product) return;

  // parseFloat превращает "7.00" в 7, "0.50" в 0.5
  let total = parseFloat(product.price);

  // Прибавляем add-price выбранного размера
  const sizeData = product.sizes[state.modal.sizeKey];
  total += parseFloat(sizeData['add-price']);

  // Прибавляем add-price каждой выбранной добавки
  state.modal.additives.forEach((index) => {
    total += parseFloat(product.additives[index]['add-price']);
  });

  // toFixed(2) округляет до двух знаков: 7.5 → "7.50"
  modalTotal.textContent = '$' + total.toFixed(2);
}

// Подписываемся на клики: открытие (по карточке) и закрытие (по overlay/кнопке)
function setupModal() {
  // Делегирование: клик по grid ловит клики по карточкам
  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.card');
    if (!card) return;
    openModal(card.dataset.name);
  });

  // Все элементы с data-modal-close закрывают модалку
  modalCloseEls.forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  // Escape закрывает
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  // Клик внутри .modal__window НЕ должен закрывать (event.target будет .modal__window или его дети)
  modal.querySelector('.modal__window').addEventListener('click', (event) => {
    event.stopPropagation();
  });
}

// ============================================================
// Точка входа
// ============================================================
async function init() {
  try {
    state.products = await loadProducts();
    setupTabs();
    setupMoreButton();
    setupResize();
    setupModal();
    renderCards();
  } catch (error) {
    console.error(error);
  }
}

init();