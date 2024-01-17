// This installs the Swiper library WebComponent for use across code.org.
// See docs here: https://swiperjs.com/swiper-api#web-component.

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
  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 1024px
    1024: {
      autoHeight: false,
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

Object.assign(swiperEl, swiperParams);
swiperEl.initialize();
