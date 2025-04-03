'use client';

import '@code-dot-org/component-library/carousel/index.css';
import React, {ReactNode, useMemo} from 'react';

import DSCOCarousel from '@code-dot-org/component-library/carousel';

import Video from '@/components/video';

export type VideoCarouselProps = {
  /** Carousel content w/ fields from Contentful */
  slides: {
    id: string;
    slide: ReactNode;
    fields: {
      videoTitle: string;
      youTubeId: string;
      videoFallbackFile: {fields: {file: {url: string}}};
    };
  }[];
};

const VideoCarousel: React.FC<VideoCarouselProps> = ({slides}) => {
  // Show placeholder text until a content entry is added
  if (slides == null) {
    return (
      <div style={{color: 'var(--text-neutral-primary)'}}>
        <em>
          <strong>🎠 Video carousel placeholder.</strong> Please add a
          "Carousel" content type entry in the Content sidebar, save, and open
          the preview tab to see the carousel in action.
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
              videoFallback={videoFallbackFile?.fields?.file?.url}
            />
          ),
        })),
    [slides], // Dependencies: recompute only when `slides` changes
  );

  return <DSCOCarousel showNavArrows={true} slides={slidesData} />;
};

export default VideoCarousel;
