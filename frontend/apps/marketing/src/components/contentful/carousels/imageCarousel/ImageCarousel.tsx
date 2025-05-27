'use client';

import '@code-dot-org/component-library/carousel/index.css';
import React, {useMemo} from 'react';

import DSCOCarousel, {
  CarouselProps,
} from '@code-dot-org/component-library/carousel';

import Image from '@/components/contentful/image';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export type ImageCarouselProps = {
  /** Carousel content w/ fields from Contentful */
  slides: ExperienceAsset[];
  /** Number of slides to show at once */
  slidesPerView?: Extract<CarouselProps['slidesPerView'], number>;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  slides,
  slidesPerView,
}) => {
  if (!slides) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🖼️ Image carousel placeholder.</strong> Please add a
          "Carousel" content type entry in the Content sidebar, save, and open
          the preview tab to see the carousel in action.
        </em>
      </div>
    );
  }

  const slidesData = useMemo(
    () =>
      slides
        .filter(slide => slide?.fields?.file?.url)
        .map(({fields}) => {
          const {title, description, file} = fields;

          return {
            id: title,
            slide: <Image src={file?.url} altText={description} />,
          };
        }),
    [slides],
  );

  return (
    <DSCOCarousel
      showNavArrows={true}
      slidesPerView={slidesPerView}
      slidesPerGroup={1}
      allowTouchMove
      slides={slidesData}
    />
  );
};

export default ImageCarousel;
