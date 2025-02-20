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
  children?: ReactNode;
}

const SwiperCarousel: React.FC<CarouselProps> = ({
  carouselId,
  showNavArrows = true,
  slidesPerView = 2,
  slidesPerGroup = 2,
  allowTouchMove = false,
  autoHeight = false,
  children,
  className,
  ...HTMLAttributes
}: CarouselProps) => {
  return (
    <div
      className={classNames(moduleStyles.carouselWrapper, className)}
      {...HTMLAttributes}
    >
      <div className={classNames(moduleStyles.carousel, className)}>
        {/* Swiper carousel */}
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          allowTouchMove={allowTouchMove}
          autoHeight={autoHeight}
          spaceBetween={24}
          navigation={{
            nextEl: `.${carouselId}-next`,
            prevEl: `.${carouselId}-prev`,
            enabled: showNavArrows,
          }}
          pagination={{
            clickable: true,
            el: `.${carouselId}-pagination`,
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
                  key={`${carouselId}-${index.toString()}`}
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
                `${carouselId}-prev`,
              )}
            >
              <FontAwesomeV6Icon iconName="arrow-left" />
            </button>
            {/* Next button */}
            <button
              className={classNames(
                moduleStyles.swiperNavNext,
                `${carouselId}-next`,
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
          `${carouselId}-pagination`,
        )}
      ></div>
    </div>
  );
};

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✘) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Section.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Carousel Component.
 * A container for carousel content including Action Blocks, Videos, and Images.
 * Uses Swiper.js for carousel functionality: https://swiperjs.com/swiper-api.
 */
const Carousel: React.FC<CarouselProps> = props => {
  // Generate a unique identifier for each carousel instance
  // to target the carousel navigation elements.
  // Identifiers must start with a letter, so prepend 'id-'.
  const uuid = 'id-' + crypto.randomUUID();
  return <SwiperCarousel {...props} carouselId={uuid} />;
};

export default Carousel;
