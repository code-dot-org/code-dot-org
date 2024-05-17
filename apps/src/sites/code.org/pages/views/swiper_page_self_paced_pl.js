// Adds carousel functionality to code.org/educate/professional-development-online

// This uses the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const swipers = [
  document.querySelector('swiper-container.swiper-elementary'),
  document.querySelector('swiper-container.swiper-middle'),
  document.querySelector('swiper-container.swiper-high'),
];

const swiperParams = {
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
    `,
  ],
};

swipers.forEach(swiper => {
  Object.assign(swiper, swiperParams);
  swiper.initialize();
});
