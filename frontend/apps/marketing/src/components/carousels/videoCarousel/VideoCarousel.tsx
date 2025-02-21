'use client';

import '@code-dot-org/component-library/carousel/index.css';
import {Carousel} from '@code-dot-org/component-library/carousel';
import React, {ReactNode} from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type VideoCarouselProps = {
  /** Carousel content */
  children: {id: string; child: ReactNode}[];
};

const VideoCarousel: React.FC<VideoCarouselProps> = ({children}) => {
  return (
    <Carousel
      slides={children.map(child => ({id: child.id, slide: child.child}))}
      className={''}
    />
  );
};

export default VideoCarousel;
