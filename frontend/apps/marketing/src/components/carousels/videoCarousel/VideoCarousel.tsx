'use client';

import '@code-dot-org/component-library/carousel/index.css';
import DSCOCarousel, {
  CarouselProps,
} from '@code-dot-org/component-library/carousel';
import React, {ReactNode, useId} from 'react';

import Video from '@code-dot-org/component-library/video';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface VideoCarouselProps extends CarouselProps {
  slides: {
    id: string;
    slide: ReactNode;
    fields: {
      videoTitle: string;
      youTubeId: string;
      videoFallbackFile: {fields: {file: {url: string}}};
    };
  }[];
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({slides, ...props}) => {
  const carouselId = `id-${useId().replaceAll(':', '')}`;

  // Workaround for the experience builder not working with Array
  if (slides[0] == null) {
    return <div>Please open the preview tab to preview the carousel.</div>;
  }

  const getSlides = () => {
    const carouselSlides = [];

    for (const carouselSlide of slides) {
      if (!carouselSlide) {
        continue;
      }

      const {videoTitle, youTubeId} = carouselSlide.fields;

      carouselSlides.push({
        id: carouselSlide.fields.youTubeId,
        slide: (
          <Video
            videoTitle={videoTitle}
            youTubeId={youTubeId}
            showCaption={true}
            videoFallback={
              carouselSlide.fields.videoFallbackFile?.fields.file.url
            }
          />
        ),
      });
    }

    return carouselSlides;
  };

  return (
    <>
      <DSCOCarousel
        {...props}
        carouselId={carouselId}
        showNavArrows={true}
        slides={getSlides()}
      />
    </>
  );
};

export default VideoCarousel;
