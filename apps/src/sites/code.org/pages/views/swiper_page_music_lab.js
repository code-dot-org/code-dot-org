// Adds carousel functionality to code.org/music

// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.

// import function to register Swiper custom elements
import {register} from 'swiper/element/bundle';
// register Swiper custom elements
register();

const swiperQuotes = document.querySelector(
  'swiper-container.music-lab-quotes'
);
// TODO - Show this when the video section is added to the page
// const swiperVideos = document.querySelector('swiper-container.music-lab-videos');

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

// TODO - Show this when the video section is added to the page
// const videosParams = {
//   ...commonParams,
//   autoHeight: false,
//   // Responsive breakpoints
//   breakpoints: {
//     // when window width is >= 768px
//     768: {
//       slidesPerView: 2,
//       slidesPerGroup: 2,
//     },
//   },
// };

const setSwiperParams = (swiper, params) => {
  Object.assign(swiper, params);
  swiper.initialize();
};

const swipers = [
  {swiper: swiperQuotes, params: quotesParams},
  // TODO - Show this when the video section is added to the page
  // {swiper: swiperVideos, params: videosParams},
];

swipers.forEach(({swiper, params}) => setSwiperParams(swiper, params));
