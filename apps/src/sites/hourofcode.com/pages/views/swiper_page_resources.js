// Adds carousel functionality to hourofcode.com/resources

// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const swiperVideos = document.querySelector('swiper-container.videos');
const swiperPosters = document.querySelector('swiper-container.posters');
const swiperEmails = document.querySelector('swiper-container.emails');

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

const postersParams = {
  ...commonParams,
  autoHeight: false,
  breakpoints: {
    // when window width is >= 768px
    768: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    },
    // when window width is >= 1024px
    1024: {
      slidesPerView: 4,
      slidesPerGroup: 4,
    },
  },
};

const emailsParams = {
  ...commonParams,
  autoHeight: true,
  allowTouchMove: false,
};

const setSwiperParams = (swiper, params) => {
  Object.assign(swiper, params);
  swiper.initialize();
};

const swipers = [
  {swiper: swiperVideos, params: videosParams},
  {swiper: swiperPosters, params: postersParams},
  {swiper: swiperEmails, params: emailsParams},
];

swipers.forEach(({swiper, params}) => setSwiperParams(swiper, params));
