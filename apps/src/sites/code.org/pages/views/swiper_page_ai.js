// Adds carousel functionality to code.org/ai

// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const swiperActionBlocksMiddleHigh = document.querySelector(
  'swiper-container.swiper-middle-high'
);
const swiperActionBlocksPl = document.querySelector(
  'swiper-container.swiper-pl'
);
const swiperQuotes = document.querySelector('swiper-container.swiper-quotes');
const swiperVideos = document.querySelector('swiper-container.how-ai-works');

const commonParams = {
  pagination: {
    clickable: true,
  },
  spaceBetween: 24,
  // Custom CSS
  injectStyles: [
    `
      :host .swiper-pagination {
        position: relative;
        margin-top: 2rem;
      }
    `,
  ],
};

const actionBlocksParams = {
  ...commonParams,
  autoHeight: false,
  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 768px
    768: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },
    // when window width is >= 1024px
    1024: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    },
  },
};

const quotesParams = {
  ...commonParams,
  autoHeight: true,
  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 640px
    640: {
      autoHeight: false,
    },
  },
};

const videosParams = {
  ...commonParams,
  autoHeight: false,
  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 768px
    768: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },
  },
};

const setSwiperParams = (swiper, params) => {
  Object.assign(swiper, params);
  swiper.initialize();
};

const swipers = [
  {swiper: swiperActionBlocksMiddleHigh, params: actionBlocksParams},
  {swiper: swiperActionBlocksPl, params: actionBlocksParams},
  {swiper: swiperQuotes, params: quotesParams},
  {swiper: swiperVideos, params: videosParams},
];

swipers.forEach(({swiper, params}) => setSwiperParams(swiper, params));
