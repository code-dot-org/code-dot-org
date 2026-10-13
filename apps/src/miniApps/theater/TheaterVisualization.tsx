import {visuallyHidden} from '@mui/utils';
import React, {useEffect, useRef} from 'react';

import {
  THEATER_AUDIO_ID,
  THEATER_IMAGE_ID,
  TheaterDescription,
} from './constants';

import moduleStyles from './theater.module.scss';

// Lets the run button's label change be read before the description.
const AFTER_RUN_ANNOUNCEMENT_MS = 250;

interface TheaterVisualizationProps {
  description?: TheaterDescription | null;
  isRunning?: boolean;
}

function linesFor(description?: TheaterDescription | null): string[] {
  switch (description?.status) {
    case 'pending':
      return ['Describing the stage.'];
    case 'ready':
      return [description.summary, ...(description.detail?.split('\n') ?? [])];
    case 'unavailable':
      return ['A description of the stage is not available.'];
    default:
      return [];
  }
}

// Shared theater output: the generated image plus its audio track. The Theater
// mini-app drives both elements by id.
const TheaterVisualization: React.FunctionComponent<
  TheaterVisualizationProps
> = ({description, isRunning = false}) => {
  const liveRegion = useRef<HTMLDivElement>(null);

  // Filled by hand: a React re-render with the same text is silent, and
  // VoiceOver dropped polite updates.
  useEffect(() => {
    const element = liveRegion.current;
    if (!element) {
      return;
    }
    element.textContent = '';
    const lines = linesFor(description).filter(line => line.trim());
    if (!lines.length || isRunning) {
      return;
    }
    const delay =
      description?.status === 'pending' ? 0 : AFTER_RUN_ANNOUNCEMENT_MS;
    const timer = window.setTimeout(() => {
      for (const line of lines) {
        const paragraph = document.createElement('p');
        paragraph.textContent = line;
        element.appendChild(paragraph);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [description, isRunning]);

  return (
    <div className={moduleStyles.theaterContainer}>
      <img
        id={THEATER_IMAGE_ID}
        className={moduleStyles.image}
        alt={description?.status === 'ready' ? description.summary : ''}
      />
      {/* The audio is generated at runtime, so there is no caption track. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id={THEATER_AUDIO_ID} preload="auto" />
      <div
        ref={liveRegion}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={visuallyHidden}
      />
    </div>
  );
};

export default TheaterVisualization;
