// Adds carousel functionality to hourofcode.com/beyond

// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const actionBlocksParams = {
  autoHeight: false,
  pagination: {
    clickable: true,
  },
  spaceBetween: 24,
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
  // Custom CSS
  injectStyles: [
    `
      :host .swiper-pagination {
        position: relative;
        margin-top: 2rem;
      }

      .swiper-pagination-bullet {
        margin-block: 0.5rem !important;
      }
    `,
  ],
};

const setSwiperParams = (swiper, params) => {
  Object.assign(swiper, params);
  swiper.initialize();
};

const swipers = [
  {
    swiper: document.querySelector('swiper-container#collection-es'),
    params: actionBlocksParams,
  },
  {
    swiper: document.querySelector('swiper-container#collection-ms'),
    params: actionBlocksParams,
  },
  {
    swiper: document.querySelector('swiper-container#collection-hs'),
    params: actionBlocksParams,
  },
];

swipers.forEach(({swiper, params}) => setSwiperParams(swiper, params));
