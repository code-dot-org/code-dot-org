'use client';

import '@code-dot-org/component-library/carousel/index.css';
import DSCOCarousel, {
  CarouselProps,
} from '@code-dot-org/component-library/carousel';
import React from 'react';

// import Video from '@code-dot-org/component-library/video';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const VideoCarousel: React.FC<CarouselProps> = ({slides, ...props}) => (
  <>
    <pre>{JSON.stringify(slides, null, 2)}</pre>
    <DSCOCarousel
      {...props}
      showNavArrows={true}
      // slides={slides?.map(slide => ({
      //   id: 'id-' + crypto.randomUUID(),
      //   slide: <Video {...slide.props} />,
      // }))}
    />
  </>
);

export default VideoCarousel;
