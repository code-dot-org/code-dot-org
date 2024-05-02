import React, {memo} from 'react';
import moduleStyles from './progress-slider.module.scss';

interface ProgressSliderProps {
  min: number;
  max: number;
  value: number;
}

const ProgressSlider: React.FunctionComponent<ProgressSliderProps> = ({
  min,
  max,
  value,
}) => {
  let progressValue = value;
  if (value < min) {
    progressValue = min;
  } else if (value > max) {
    progressValue = max;
  }
  return (
    <div className={moduleStyles.slider}>
      <div
        className={moduleStyles.progressBar}
        style={{width: `${progressValue}%`}}
      />
      <div
        className={moduleStyles.playhead}
        style={{left: progressValue * 2}}
      />
    </div>
  );
};

export default memo(ProgressSlider);
