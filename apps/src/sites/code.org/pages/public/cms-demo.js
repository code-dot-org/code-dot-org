import React from 'react';
import ReactDOM from 'react-dom';
// This installs the Swiper library WebComponent.
// See docs here: https://swiperjs.com/swiper-api#web-component.
import {register} from 'swiper/element/bundle';

import ProjectCardRow from '@cdo/apps/templates/projects/ProjectCardRow';

// import function to register Swiper custom elements
// register Swiper custom elements
register();

document.addEventListener('DOMContentLoaded', () => {
  showProjects();
  setupSwiperCarousels();
});

const showProjects = () => {
  const TRANSFORMERSONE_PROJECTS = [
    {
      name: 'Catch Megatron!',
      key: 'catch_megatron',
      channel: 'KRhjKpvWoPIcDPMmvD91NCm23S9SshJH4JQPVh0zkv8',
    },
    {
      name: 'Elita',
      key: 'elita',
      channel: '-jyvYo6WibyXD0HbMVfiOAl7H28LnP7_0PXR-Sgf6TE',
    },
    {
      name: 'Click the Cog',
      key: 'click_the_cog',
      channel: '0NalG1oERxEncUaxvibF8ZbccP9tY5qU5Hz7pdGcifA',
    },
    {
      name: 'Optimus Prime',
      key: 'optimus_prime',
      channel: '1rlHhoDtD9uqspF9I7HDJtWOewKeCjRIc9QVq-ASZ3E',
    },
  ].map(project => ({
    type: 'spritelab',
    thumbnailUrl: `/images/transformers/${project.key}.png`,
    ...project,
  }));

  const container = document.getElementById('transformersone_student_projects');
  ReactDOM.render(
    <ProjectCardRow
      galleryType="public"
      showFullThumbnail={true}
      projects={TRANSFORMERSONE_PROJECTS}
    />,
    container
  );
};

const setupSwiperCarousels = () => {
  const swiperActionBlocksPl = document.querySelector(
    'swiper-container.swiper-pl'
  );
  const swiperQuotes = document.querySelector('swiper-container.swiper-quotes');
  const swiperQuotes2 = document.querySelector(
    'swiper-container#mid-high-carousel'
  );
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
    {swiper: swiperActionBlocksPl, params: actionBlocksParams},
    {swiper: swiperQuotes, params: quotesParams},
    {swiper: swiperQuotes2, params: quotesParams},
    {swiper: swiperVideos, params: videosParams},
  ];

  swipers.forEach(({swiper, params}) => setSwiperParams(swiper, params));
};
