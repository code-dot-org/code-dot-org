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
 */
const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  ...HTMLAttributes
}: CarouselProps) => {
  return (
    <div
      className={classNames(moduleStyles.carouselWrapper, className)}
      {...HTMLAttributes}
    >
      <div className={classNames(moduleStyles.carousel)}>
        {/* Prev button */}
        <button
          className={classNames(moduleStyles.swiperNavPrev, 'swiperNavPrev')}
        >
          <FontAwesomeV6Icon iconName="arrow-left" />
        </button>
        {/* Swiper carousel */}
        <Swiper
          className={moduleStyles.carousel}
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={24}
          slidesPerView={2}
          edgeSwipeThreshold={24}
          navigation={{
            nextEl: '.swiperNavNext',
            prevEl: '.swiperNavPrev',
          }}
          pagination={{
            clickable: true,
            el: '.swiperPagination',
          }}
        >
          {Array.isArray(children)
            ? children.map((child, index) => (
                <SwiperSlide key={index} className={moduleStyles.slide}>
                  {child}
                </SwiperSlide>
              ))
            : children}
        </Swiper>
        {/* Next button */}
        <button
          className={classNames(moduleStyles.swiperNavNext, 'swiperNavNext')}
        >
          <FontAwesomeV6Icon iconName="arrow-right" />
        </button>
      </div>
      {/* Pagination */}
      <div
        className={classNames(
          moduleStyles.swiperPagination,
          'swiperPagination',
        )}
      ></div>
    </div>
  );
};

export default Carousel;
