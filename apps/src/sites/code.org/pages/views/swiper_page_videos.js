// Adds carousel functionality to code.org/videos

// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const swipers = [
  document.querySelector('swiper-container.swiper-01'),
  document.querySelector('swiper-container.swiper-02'),
];

const swiperParams = {
  autoHeight: false,
  pagination: {
    clickable: true,
  },
  spaceBetween: 24,
  observeSlideChildren: true,
  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 768px
    768: {
      slidesPerView: 2,
      slidesPerGroup: 2,
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
