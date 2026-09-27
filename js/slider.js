const slider = document.querySelector('.slider');

if (slider) {
  const list = slider.querySelector('.slider__list');
  const slides = slider.querySelectorAll('.slider__slide');
  const prevBtn = slider.querySelector('.slider__arrow--prev');
  const nextBtn = slider.querySelector('.slider__arrow--next');
  const dots = document.querySelectorAll('.slider__dot');

  let currentIndex = 0;

  function getStep() {
    if (slides.length < 2) return 0;
    const slideWidth = slides[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(list).gap) || 0;
    return slideWidth + gap;
  }

  function goToSlide(index) {
    const total = slides.length;
    currentIndex = ((index % total) + total) % total;

    list.style.transform = `translateX(-${currentIndex * getStep()}px)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
    });
  }

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
  });

  window.addEventListener('resize', () => {
    goToSlide(currentIndex);
  });
}