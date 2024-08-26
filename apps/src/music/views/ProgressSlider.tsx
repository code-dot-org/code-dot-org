import React, {memo} from 'react';

import moduleStyles from './progress-slider.module.scss';

interface ProgressSliderProps {
  percentProgress: number;
}

/*
 * A progress slider that displays the current progress of a music lab song.
 * The slider is a gray bar that fills up with a white color as the song progresses.
 * A playhead moves along the slider to show the current progress of the song.
 * @param percentProgress - The percentage of the song that has been played.
 */
const ProgressSlider: React.FunctionComponent<ProgressSliderProps> = ({
  percentProgress,
}) => {
  const boundedPercentProgress = Math.min(Math.max(0, percentProgress), 100);
  console.log('boundedPercentProgress', boundedPercentProgress);
  //const sliderWidth = parseInt(moduleStyles.sliderWidth.replace('px', ''));
  const sliderWidth = boundedPercentProgress * 100;
  const playheadLeft = sliderWidth-1;
  console.log('sliderWidth', sliderWidth);
  // const playheadDisplacement = (boundedPercentProgress / 100) * sliderWidth;
  return (
    <div className={moduleStyles.slider}>
      <div
        className={moduleStyles.progressBar}
        style={{width: `${sliderWidth}%`}}
      />
      <div
        className={moduleStyles.playhead}
        style={{
          left: `${playheadLeft}%`,
        }}
      />
    </div>
  );
};

export default memo(ProgressSlider);
