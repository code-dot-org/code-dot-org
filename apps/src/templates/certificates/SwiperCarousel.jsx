import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';

import style from './swiper.module.scss';

export default function SwiperCarousel({slideSet, renderSlide}) {
  console.log(slideSet);

  const swiperRef = useRef(null);
  useEffect(() => {
    console.log('init swiper');
    if (swiperRef.current) {
      const swiperParams = {
        autoHeight: true,
        pagination: {
          clickable: true,
        },
        spaceBetween: 24,
        slidesPerView: 1,
        slidesPerGroup: 1,
        breakpoints: {
          640: {
            autoHeight: false,
          },
        },
        injectStyles: [
          `
            :host .swiper-pagination {
              position: relative;
              //margin-top: 2rem;

              .swiper-pagination-bullet {
                margin-block: 0.5rem;
              }
            }
            `,
        ],
      };
      Object.assign(swiperRef.current, swiperParams);
      swiperRef.current.initialize();

      /*swiperRef.current.addEventListener('swiperslidechange', e => {
        const [swiper] = e.detail;
        setCurrentImageIndex(swiper.activeIndex);
      });*/
    }
  }, []);

  return (
    <>
      <swiper-container
        init="false"
        ref={swiperRef}
        class={style.swiperContainer}
        //navigation="true"
        //navigation-next-el="#swiper-next-el"
        //navigation-prev-el="#swiper-prev-el"
      >
        {slideSet.map((slide, index) => {
          return <swiper-slide key={index}>{renderSlide(slide)}</swiper-slide>;
        })}
      </swiper-container>
      {/*<button id='swiper-prev-el' className={classNames(style.navButton, style.prevElNav)} type='button'/>*/}
      {/*<button id='swiper-next-el' className={classNames(style.navButton, style.nextElNav)} type='button'/>*/}
    </>
  );
}

SwiperCarousel.propTypes = {
  slideSet: PropTypes.array.isRequired,
  renderSlide: PropTypes.func.isRequired,
};
