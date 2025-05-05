'use client';

import '@code-dot-org/component-library/carousel/index.css';
import {EntryFields} from 'contentful';
import React, {useMemo} from 'react';

import DSCOCarousel from '@code-dot-org/component-library/carousel';

import Video from '@/components/video';
import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type VideoCarouselFields = {
  videoTitle: EntryFields.Text;
  youTubeId: EntryFields.Text;
  videoFallbackFile: ExperienceAsset;
};

type VideoCarouselEntry = Entry<VideoCarouselFields>;

export type VideoCarouselProps = {
  /** Carousel content w/ fields from Contentful */
  slides: VideoCarouselEntry[];
};

const VideoCarousel: React.FC<VideoCarouselProps> = ({slides}) => {
  if (!slides) {
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
      slides.filter(Boolean).map(({fields}) => {
        const {videoTitle, youTubeId, videoFallbackFile} = fields;

        return {
          id: youTubeId,
          slide: (
            <Video
              videoTitle={videoTitle}
              youTubeId={youTubeId}
              showCaption={true}
              videoFallback={videoFallbackFile?.fields?.file?.url}
            />
          ),
        };
      }),
    [slides],
  );

  return <DSCOCarousel showNavArrows={true} slides={slidesData} />;
};

export default VideoCarousel;
