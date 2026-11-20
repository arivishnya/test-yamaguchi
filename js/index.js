const DESKTOP_MIN = 1024;
const wasDesktop = document.documentElement.clientWidth >= DESKTOP_MIN;

if (wasDesktop) {
  initSlider();
}

window.addEventListener('resize', () => {
  const isDesktop = document.documentElement.clientWidth >= DESKTOP_MIN;
  if (isDesktop !== wasDesktop) location.reload();
});

function initSlider() {
  const mainContainer = document.querySelector('.main-container');
  const navigation = document.querySelector('.test-yamaguchi-slide-navigation');
  const navigationItems = document.querySelectorAll('.slide-navigation__item');
  const slides = document.querySelectorAll('.slide');

  const BUTTON_ORDER = [1, 0, 2];
  const GAP = 90; // расстояние между иконками по вертикали
  const CURVE = 20; // насколько дуга уводит боковые иконки влево
  const OFFSET_X = 95; // положение колеса от левого края экрана

  let finishAnimation = true;
  let currentSlide = 0;

  function placeButton() {
    const center = BUTTON_ORDER.indexOf(currentSlide);

    navigationItems.forEach((item) => {
      const index = Number(item.dataset.slide);
      let offset = (((BUTTON_ORDER.indexOf(index) - center) % 3) + 3) % 3;
      if (offset === 2) offset = -1;

      const x = OFFSET_X - CURVE * Math.abs(offset);
      const y = offset * GAP;

      item.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      item.classList.toggle('is-active', index === currentSlide);
    });
  }

  function goTo(index) {
    if (
      !finishAnimation ||
      index === currentSlide ||
      index < 0 ||
      index >= slides.length
    )
      return;

    const direction = index > currentSlide ? 1 : -1;
    const prev = slides[currentSlide];
    const next = slides[index];

    next.classList.add('no-animation');
    next.dataset.pos = direction > 0 ? 'below' : 'above';
    void next.offsetHeight;
    next.classList.remove('no-animation');
    next.classList.add('is-active');

    prev.classList.remove('is-active');
    prev.dataset.pos = direction > 0 ? 'above' : 'below';

    currentSlide = index;
    finishAnimation = false;
    placeButton();
    setTimeout(() => {
      finishAnimation = true;
    }, 1000);
  }

  let scrollDelta = 0;
  const MAX_SCROLL_DELTA = 60;
  let resetTimer;

  mainContainer.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();

      scrollDelta += event.deltaY;

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        scrollDelta = 0;
      }, 200);

      if (Math.abs(scrollDelta) >= MAX_SCROLL_DELTA) {
        goTo(currentSlide + Math.sign(scrollDelta));
        scrollDelta = 0;
      }
    },
    { passive: false },
  );

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      goTo(currentSlide + 1);
    }

    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      goTo(currentSlide - 1);
    }
  });

  navigationItems.forEach((item) => {
    item.addEventListener('click', () => goTo(Number(item.dataset.slide)));
  });

  placeButton();
  navigation.classList.add('is-ready');
}
