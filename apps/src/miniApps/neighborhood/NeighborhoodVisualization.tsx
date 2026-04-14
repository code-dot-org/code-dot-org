import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Slider from '@code-dot-org/component-library/slider';
import React from 'react';

import MazeVisualization from '@cdo/apps/maze/Visualization';
import commonI18n from '@cdo/locale';

import NeighborhoodSpeedTracker from './NeighborhoodSpeedTracker';

import moduleStyles from './neighborhood.module.scss';

interface NeighborhoodVisualizationProps {
  className?: string;
  isDarkMode?: boolean;
  useProtectedDiv?: boolean;
}

const NeighborhoodVisualization: React.FunctionComponent<
  NeighborhoodVisualizationProps
> = ({className, isDarkMode, useProtectedDiv = true}) => {
  const [sliderValue, setSliderValue] = React.useState(
    NeighborhoodSpeedTracker.getInstance().getSpeed()
  );
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    setSliderValue(newSpeed);
    NeighborhoodSpeedTracker.getInstance().setSpeed(newSpeed);
  };

  return (
    <div className={className}>
      <div className={moduleStyles.neighborhoodPreviewBackground}>
        <MazeVisualization useProtectedDiv={useProtectedDiv} />
      </div>
      <div className={moduleStyles.sliderContainer}>
        <Slider
          name="neighborhood-speed"
          value={sliderValue}
          onChange={handleSpeedChange}
          color={isDarkMode ? 'white' : 'black'}
          isPercentMode={true}
          hideValue={true}
          leftButtonProps={{
            'aria-label': commonI18n.decreaseSpeed(),
            children: (
              <FontAwesomeV6Icon
                iconName="turtle"
                title={commonI18n.decreaseSpeed()}
              />
            ),
            size: 'small',
          }}
          rightButtonProps={{
            'aria-label': commonI18n.increaseSpeed(),
            children: (
              <FontAwesomeV6Icon
                iconName="rabbit"
                title={commonI18n.increaseSpeed()}
              />
            ),
            size: 'small',
          }}
          className={moduleStyles.slider}
        />
      </div>
    </div>
  );
};
export default NeighborhoodVisualization;
