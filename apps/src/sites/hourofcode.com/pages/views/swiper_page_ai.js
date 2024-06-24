// Adds carousel functionality to hourofcode.com/ai

// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const commonParams = {
  autoHeight: false,
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

const videosParams = {
  ...commonParams,
  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 768px
    768: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },
  },
};

const actionBlocksParams = {
  ...commonParams,
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

const setSwiperParams = (swiper, params) => {
  Object.assign(swiper, params);
  swiper.initialize();
};

const swipers = [
  {
    swiper: document.querySelector('swiper-container.how-ai-works-videos'),
    params: videosParams,
  },
  {
    swiper: document.querySelector('swiper-container.how-ai-works-lessons'),
    params: actionBlocksParams,
  },
  {
    swiper: document.querySelector('swiper-container.ai-101-series'),
    params: actionBlocksParams,
  },
  {
    swiper: document.querySelector('swiper-container.ai-educator-resources'),
    params: actionBlocksParams,
  },
];

swipers.forEach(({swiper, params}) => setSwiperParams(swiper, params));
