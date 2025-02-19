import classNames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

// Import Swiper React components
// See Swiper documentation here: https://swiperjs.com/react
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, A11y} from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import moduleStyles from './carousel.module.scss';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon/FontAwesomeV6Icon';

export interface CarouselProps extends HTMLAttributes<HTMLElement> {
  /** Carousel custom className (required) */
  carouselName: string;
  /** Number of slides per view */
  slidesPerView?: number;
  /** Number of slides per group */
  slidesPerGroup?: number;
  /** Show navigation arrows */
  showNavArrows?: boolean;
  /** Carousel content */
  children?: ReactNode;
}

/**
 * ## Production-ready Checklist:
 *  * (✘) implementation of component approved by design team;
 *  * (✘) has storybook, covered with stories and documentation;
 *  * (✘) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Section.test.tsx)
 *  * (✘) passes accessibility checks;
 *
 * ### Status: ```WIP```
 *
 * Design System: Carousel Component.
 * A container for carousel content including Action Blocks, Videos, and Images.
 * Uses Swiper.js for carousel functionality: https://swiperjs.com/swiper-api.
 */
const Carousel: React.FC<CarouselProps> = ({
  carouselName = 'carousel-01',
  showNavArrows = true,
  slidesPerView = 2,
  slidesPerGroup = 2,
  children,
  className,
  ...HTMLAttributes
}: CarouselProps) => {
  return (
    <div
      className={classNames(moduleStyles.carouselWrapper, className)}
      {...HTMLAttributes}
    >
      <div className={classNames(moduleStyles.carousel, carouselName)}>
        {/* Swiper carousel */}
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          autoHeight={false}
          allowTouchMove={false}
          spaceBetween={24}
          navigation={{
            nextEl: `.${carouselName}-next`,
            prevEl: `.${carouselName}-prev`,
            enabled: showNavArrows,
          }}
          pagination={{
            clickable: true,
            el: `.${carouselName}-pagination`,
          }}
          breakpoints={{
            // when window width is >= 768px
            768: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            // when window width is >= 1024px
            1024: {
              slidesPerView: slidesPerView,
              slidesPerGroup: slidesPerGroup,
            },
          }}
        >
          {Array.isArray(children)
            ? children.map((child, index) => (
                <SwiperSlide
                  key={`${carouselName}-${index.toString()}`}
                  className={className}
                >
                  {child}
                </SwiperSlide>
              ))
            : children}
        </Swiper>
        {showNavArrows && (
          <div className={moduleStyles.navArrowWrapper}>
            {/* Previous button */}
            <button
              className={classNames(
                moduleStyles.swiperNavPrev,
                `${carouselName}-prev`,
              )}
            >
              <FontAwesomeV6Icon iconName="arrow-left" />
            </button>
            {/* Next button */}
            <button
              className={classNames(
                moduleStyles.swiperNavNext,
                `${carouselName}-next`,
              )}
            >
              <FontAwesomeV6Icon iconName="arrow-right" />
            </button>
          </div>
        )}
      </div>
      {/* Pagination */}
      <div
        className={classNames(
          moduleStyles.swiperPagination,
          `${carouselName}-pagination`,
        )}
      ></div>
    </div>
  );
};

export default Carousel;
