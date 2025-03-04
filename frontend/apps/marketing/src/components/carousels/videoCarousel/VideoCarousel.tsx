'use client';

import '@code-dot-org/component-library/carousel/index.css';
import DSCOCarousel, {
  CarouselProps,
} from '@code-dot-org/component-library/carousel';
import React, {ReactNode, useState, useEffect} from 'react';

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <DSCOCarousel
          {...props}
          showNavArrows={true}
          slides={slides?.map(slide => {
            const {videoTitle, youTubeId} = slide.fields || {};
            return {
              id: slide.fields.youTubeId,
              slide: (
                <Video
                  videoTitle={videoTitle}
                  youTubeId={youTubeId}
                  showCaption={true}
                  videoFallback={
                    slide.fields.videoFallbackFile?.fields.file.url
                  }
                />
              ),
            };
          })}
        />
      )}
    </>
  );
};

export default VideoCarousel;
