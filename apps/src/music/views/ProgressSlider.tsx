import React, {memo} from 'react';
import moduleStyles from './progress-slider.module.scss';

interface ProgressSliderProps {
  progressValue: number;
}

const ProgressSlider: React.FunctionComponent<ProgressSliderProps> = ({
  progressValue,
}) => {
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
