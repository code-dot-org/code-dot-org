import classNames from 'classnames';
import {HTMLAttributes, ReactNode, useId} from 'react';
// Import Swiper React components
// See Swiper documentation here: https://swiperjs.com/react
import {Navigation, Pagination, A11y} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './carousel.module.scss';

export interface CarouselProps extends HTMLAttributes<HTMLElement> {
  /** Unique identifier for the carousel instance */
  carouselId?: string;
  /** Number of slides per view */
  slidesPerView?: number;
  /** Number of slides per group */
  slidesPerGroup?: number;
  /** Allow touch move */
  allowTouchMove?: boolean;
  /** Auto height */
  autoHeight?: boolean;
  /** Show navigation arrows */
  showNavArrows?: boolean;
  /** Carousel content */
  slides: {id?: string; slide?: ReactNode}[];
  /** Carousel custom class name */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Section.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Carousel Component.
 * A container for carousel content including Action Blocks, Videos, and Images.
 * Uses Swiper.js for carousel functionality: https://swiperjs.com/swiper-api.
 */
const Carousel: React.FC<CarouselProps> = ({
  carouselId = `id-${useId().replaceAll(':', '')}`,
  showNavArrows = true,
  slidesPerView = 2,
  slidesPerGroup = 2,
  allowTouchMove = false,
  autoHeight = false,
  slides,
  className,
  ...HTMLAttributes
}: CarouselProps) => {
  // Constants for carousel configuration
  const slideGap = 20;
  const breakpointTablet = 768;
  const breakpointDesktop = 1024;

  return (
    <div
      className={classNames(moduleStyles.carouselWrapper, className)}
      {...HTMLAttributes}
    >
      <div className={classNames(moduleStyles.carousel)}>
        {/* Swiper carousel */}
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          allowTouchMove={allowTouchMove}
          autoHeight={autoHeight}
          spaceBetween={slideGap}
          navigation={{
            nextEl: `#${carouselId}-next`,
            prevEl: `#${carouselId}-prev`,
            enabled: showNavArrows,
          }}
          pagination={{
            clickable: true,
            el: `#${carouselId}-pagination`,
          }}
          breakpoints={{
            // when window width is tablet
            [breakpointTablet]: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            // when window width is desktop
            [breakpointDesktop]: {
              slidesPerView: slidesPerView,
              slidesPerGroup: slidesPerGroup,
            },
          }}
        >
          {slides?.map(({id, slide}) => (
            <SwiperSlide key={id}>{slide}</SwiperSlide>
          ))}
        </Swiper>
        {showNavArrows && (
          <div className={moduleStyles.navArrowWrapper}>
            {/* Previous button */}
            <button
              id={`${carouselId}-prev`}
              className={classNames(moduleStyles.swiperNavPrev)}
              aria-label={'Previous slide'}
            >
              <FontAwesomeV6Icon iconName="arrow-left" />
            </button>
            {/* Next button */}
            <button
              id={`${carouselId}-next`}
              className={classNames(moduleStyles.swiperNavNext)}
              aria-label={'Next slide'}
            >
              <FontAwesomeV6Icon iconName="arrow-right" />
            </button>
          </div>
        )}
      </div>
      {/* Pagination */}
      <div
        id={`${carouselId}-pagination`}
        className={classNames(moduleStyles.swiperPagination)}
      ></div>
    </div>
  );
};

export default Carousel;
