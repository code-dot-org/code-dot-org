// Adds carousel functionality to code.org/promote

// This uses the Swiper library WebComponent.
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
