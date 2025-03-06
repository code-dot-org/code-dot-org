'use client';

import '@code-dot-org/component-library/carousel/index.css';
import DSCOCarousel, {
  CarouselProps,
} from '@code-dot-org/component-library/carousel';
import React, {ReactNode, useMemo} from 'react';

import Video from '@code-dot-org/component-library/video';

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
  if (slides == null) {
    return (
      <div>
        <em>
          <strong>✍ Video carousel placeholder.</strong> Please add a
          "Carousel" content type entry in the Content sidebar, save, and open
          the preview tab to see the carousel. An empty carousel will show in
          this editor, but it's here.
        </em>
      </div>
    );
  }

  const slidesData = useMemo(
    () =>
      slides
        .filter(Boolean) // Removes any falsy values
        .map(({fields: {videoTitle, youTubeId, videoFallbackFile}}) => ({
          id: youTubeId,
          slide: (
            <Video
              videoTitle={videoTitle}
              youTubeId={youTubeId}
              showCaption={true}
              videoFallback={videoFallbackFile?.fields.file.url}
            />
          ),
        })),
    [slides], // Dependencies: recompute only when `slides` changes
  );

  return <DSCOCarousel {...props} showNavArrows={true} slides={slidesData} />;
};

export default VideoCarousel;
