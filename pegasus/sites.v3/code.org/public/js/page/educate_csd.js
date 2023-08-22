const windowWidth = window.innerWidth;

function reorganizeAndWrapSlides(carouselId, cardsList) {
  const carouselContainer = document.getElementById(carouselId);
  if (!carouselContainer) {
    console.error(`Carousel container with id "${carouselId}" not found.`);
    return;
  }

  const slidesContainer = carouselContainer.querySelector('.slides');
  if (!slidesContainer) {
    console.error(`Slides container not found inside the carousel.`);
    return;
  }

  const slideItems = Array.from(slidesContainer.querySelectorAll('.slide'));

  const actionBlocks = Array.from(carouselContainer.querySelectorAll('.action-block.action-block--one-col.flex-space-between'));
  actionBlocks.forEach(block => block.remove());

  const slides = [];
  while (actionBlocks.length > 0) {
    slides.push(actionBlocks.splice(0, cardsList));
  }

  slides.forEach(slide => {
    const slideWrapper = document.createElement('div');
    slideWrapper.className = 'slide';
    slide.forEach(slideItem => {
      slideWrapper.appendChild(slideItem);
    });

    slidesContainer.appendChild(slideWrapper);
  });

  slideItems.forEach(slideItem => slideItem.remove());
}

function handleScreenSize(carouselId) {
  if (windowWidth > 639 && windowWidth < 799) {
    reorganizeAndWrapSlides(carouselId, 2);
    console.log("639 - 799")

  } else if (windowWidth > 799) {
    reorganizeAndWrapSlides(carouselId, 3);
    console.log("> 800")
  }
}

$(document).ready(function () {
  let idCollections = '#collections_carousel';
  handleScreenSize('collections_carousel');
  $(idCollections + ' .slides').carouFredSel({
    auto: false,
    pagination: '#collections_carousel-pagination',
    prev: '#prev_2',
    next: '#next_2',
    responsive: true,
    width: '100%',
    height: '490',
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true
    }
  });
  let idFlexible = '#flexible_units_carousel';
  handleScreenSize('flexible_units_carousel');
  $(idFlexible + ' .slides').carouFredSel({
    auto: false,
    pagination: '#flexible_units_carousel-pagination',
    prev: '#prev_1',
    next: '#next_1',
    responsive: true,
    width: '100%',
    height: '490',
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true
    }
  });
});
