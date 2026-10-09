import React from 'react';

import {
  THEATER_AUDIO_ID,
  THEATER_DESCRIPTION_ID,
  THEATER_IMAGE_ID,
} from './constants';

import moduleStyles from './theater.module.scss';

// Shared theater output: the generated image plus its audio track. The Theater
// mini-app drives both elements by id, and fills in their descriptions.
const TheaterVisualization: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.theaterContainer}>
      <img
        id={THEATER_IMAGE_ID}
        className={moduleStyles.image}
        alt=""
        aria-describedby={THEATER_DESCRIPTION_ID}
      />
      {/* Not atomic, so a late caption is read alone, not with the scene. */}
      <div
        id={THEATER_DESCRIPTION_ID}
        className={moduleStyles.srOnly}
        aria-live="polite"
        aria-atomic="false"
      />
      {/* The audio is generated at runtime, so there is no caption track. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id={THEATER_AUDIO_ID} preload="auto" />
    </div>
  );
};

export default TheaterVisualization;
