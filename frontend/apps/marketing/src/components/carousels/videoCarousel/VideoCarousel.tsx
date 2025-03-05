'use client';

import '@code-dot-org/component-library/carousel/index.css';
import DSCOCarousel, {
  CarouselProps,
} from '@code-dot-org/component-library/carousel';
import React, {ReactNode} from 'react';

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
  // Workaround for the experience builder not working with Array
  // If you see this error add a content entry in the Content sidebar
  // and save, you should then see the placeholder message below.
  if (slides[0] == null) {
    return (
      <div>
        <em>
          <strong>✍ Video carousel placeholder.</strong> Please add a
          "Carousel" content type entry in the Content sidebar, and open the
          preview tab to see the carousel.
        </em>
      </div>
    );
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
      <DSCOCarousel {...props} showNavArrows={true} slides={getSlides()} />
    </>
  );
};

export default VideoCarousel;
