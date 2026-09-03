import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Slider from '@code-dot-org/component-library/slider';
import React from 'react';

import {PROGRAM_RUNNING} from '@cdo/apps/maze/keyboardNavigation';
import MazeVisualization from '@cdo/apps/maze/Visualization';
import commonI18n from '@cdo/locale';

import NeighborhoodSpeedTracker from './NeighborhoodSpeedTracker';

import moduleStyles from './neighborhood.module.scss';

const NAV_HINT =
  'Neighborhood grid. Press Enter to explore it with the arrow keys. ' +
  'Press P to jump to a painter, again for the next one. Press Escape to exit.';

// The keys do not work mid-run, so do not offer them.
const RUNNING_HINT = `Neighborhood grid. ${PROGRAM_RUNNING}`;

interface NeighborhoodVisualizationProps {
  className?: string;
  /** Surface the maze is drawn on. Defaults to black. */
  backgroundClassName?: string;
  isDarkMode?: boolean;
  useProtectedDiv?: boolean;
  /** Labs that run a program pass this so the grid can say it is busy. */
  isRunning?: boolean;
}

const NeighborhoodVisualization: React.FunctionComponent<
  NeighborhoodVisualizationProps
> = ({
  className,
  backgroundClassName = moduleStyles.neighborhoodPreviewBackground,
  isDarkMode,
  useProtectedDiv = true,
  isRunning = false,
}) => {
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
      <div className={backgroundClassName}>
        <MazeVisualization
          useProtectedDiv={useProtectedDiv}
          navHint={isRunning ? RUNNING_HINT : NAV_HINT}
          isRunning={isRunning}
        />
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
