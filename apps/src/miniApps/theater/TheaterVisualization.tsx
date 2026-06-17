import classNames from 'classnames';
import React from 'react';

import {THEATER_AUDIO_ID, THEATER_IMAGE_ID} from './constants';

import moduleStyles from './theater.module.scss';

interface TheaterVisualizationProps {
  className?: string;
}

// Shared theater output: the generated image plus its audio track. The Theater
// mini-app drives both elements by id.
const TheaterVisualization: React.FunctionComponent<
  TheaterVisualizationProps
> = ({className}) => {
  return (
    <div className={classNames(moduleStyles.theaterContainer, className)}>
      {/* Alt text is intentionally empty: the image is generated at runtime
          from student code, so there is no meaningful description for it. */}
      <img id={THEATER_IMAGE_ID} className={moduleStyles.image} alt="" />
      {/* The audio is generated at runtime, so there is no caption track. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id={THEATER_AUDIO_ID} preload="auto" />
    </div>
  );
};

export default TheaterVisualization;
