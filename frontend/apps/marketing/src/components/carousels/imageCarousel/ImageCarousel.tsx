'use client';

import '@code-dot-org/component-library/carousel/index.css';
import React, {useMemo} from 'react';

import DSCOCarousel from '@code-dot-org/component-library/carousel';

import Image from '@/components/image';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export type ImageCarouselProps = {
  /** Carousel content w/ fields from Contentful */
  slides: ExperienceAsset[];
  /** Number of slides to show at once */
  slidesPerView?: number;
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
      slides.filter(Boolean).map(({fields}) => {
        const {title, file} = fields;

        return {
          id: title,
          slide: <Image src={file?.url} altText="" />,
        };
      }),
    [slides],
  );

  return (
    <DSCOCarousel
      showNavArrows={true}
      slidesPerView={slidesPerView || 2}
      slidesPerGroup={slidesPerView || 2}
      allowTouchMove
      slides={slidesData}
    />
  );
};

export default ImageCarousel;
