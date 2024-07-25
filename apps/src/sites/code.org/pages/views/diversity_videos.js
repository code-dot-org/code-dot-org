// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const params = {
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

const initializeSwiper = () => {
  const swiperContainer = document.querySelector(
    'swiper-container.diversity-videos'
  );
  if (swiperContainer) {
    Object.assign(swiperContainer, params);
    swiperContainer.initialize();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSwiper);
} else {
  initializeSwiper();
}
