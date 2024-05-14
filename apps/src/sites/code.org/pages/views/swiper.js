// This installs the Swiper library WebComponent for use across code.org.
// See docs here: https://swiperjs.com/swiper-api#web-component.
// Use this implementation when there is one carousel on the page —
// for pages with multiple carousels, use the implementation seen in swiper_page_csd.js.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const swiperEl = document.querySelector('swiper-container');

const swiperParams = {
  autoHeight: true,
  pagination: {
    clickable: true,
  },
  spaceBetween: 24,
  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 640px
    640: {
      autoHeight: false,
    },
  },
  // Custom CSS
  injectStyles: [
    `
      :host .swiper-pagination {
        position: relative;
        margin-top: 2rem;

        .swiper-pagination-bullet {
          margin-block: 0.5rem;
        }
      }
    `,
  ],
};

Object.assign(swiperEl, swiperParams);
swiperEl.initialize();

// Set params for different column amounts
const setSwiperParams = (swiper, columns) => {
  let slidesPerView, slidesPerGroup;

  if (window.matchMedia('(max-width: 640px)').matches) {
    slidesPerView = slidesPerGroup = 1;
  } else if (
    columns === 3 &&
    window.matchMedia('(max-width: 1024px)').matches
  ) {
    slidesPerView = slidesPerGroup = 2;
  } else {
    slidesPerView = slidesPerGroup = columns;
  }

  swiper.slidesPerView = slidesPerView;
  swiper.slidesPerGroup = slidesPerGroup;
};

// Add a .two-col class to the <swiper-container> element to enable two columns
const twoCol = document.querySelector('swiper-container.two-col');
if (twoCol) {
  setSwiperParams(twoCol, 2);
}

// Add a .three-col class to the <swiper-container> element to enable three columns
const threeCol = document.querySelector('swiper-container.three-col');
if (threeCol) {
  setSwiperParams(threeCol, 3);
}
