import React, {memo} from 'react';
import moduleStyles from './progress-slider.module.scss';

interface ProgressSliderProps {
  min: number;
  max: number;
  value: number;
  sliderWidth: number;
}

const ProgressSlider: React.FunctionComponent<ProgressSliderProps> = ({
  min,
  max,
  value,
  sliderWidth,
}) => {
  let checkedValue = value;
  if (value < min) {
    checkedValue = min;
  } else if (value > max) {
    checkedValue = max;
  }
  const progressPercent = ((checkedValue - min) / (max - min)) * 100;
  const progressValue = ((checkedValue - min) / (max - min)) * sliderWidth;
  return (
    <div className={moduleStyles.slider}>
      <div
        className={moduleStyles.progressBar}
        style={{width: `${progressPercent}%`}}
      />
      <div
        className={moduleStyles.playhead}
        style={{
          left: progressValue,
        }}
      />
    </div>
  );
};

export default memo(ProgressSlider);
