import {useState, type ChangeEvent} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Slider from '@code-dot-org/component-library/slider';

import {LOOK_ID, SVG_ID, commonI18n} from './constants';
import NeighborhoodSpeedTracker from './NeighborhoodSpeedTracker';

import moduleStyles from './neighborhood.module.scss';

interface NeighborhoodVisualizationProps {
  className?: string;
  isDarkMode?: boolean;
}

const NeighborhoodVisualization = ({
  className,
  isDarkMode,
}: NeighborhoodVisualizationProps) => {
  const [sliderValue, setSliderValue] = useState(
    NeighborhoodSpeedTracker.getInstance().getSpeed(),
  );
  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    setSliderValue(newSpeed);
    NeighborhoodSpeedTracker.getInstance().setSpeed(newSpeed);
  };

  return (
    <div className={className}>
      <div className={moduleStyles.neighborhoodPreviewBackground}>
        {/* id="visualization" is a runtime contract with apps —
            scaleMiniApp (apps/src/codebridge/Workspace/outputHelpers.ts)
            uses a jQuery selector on this id to apply responsive
            sizing on resize. The .visualization class supplies the
            initial static layout. */}
        <div id="visualization" className={moduleStyles.visualization}>
          <svg id={SVG_ID}>
            <g id={LOOK_ID}>
              <path d="M 0,-15 a 15 15 0 0 1 15 15" />
              <path d="M 0,-35 a 35 35 0 0 1 35 35" />
              <path d="M 0,-55 a 55 55 0 0 1 55 55" />
            </g>
          </svg>
        </div>
      </div>
      {/* Pin this scope to Light theme so the white-variant slider
          renders against the fixed-dark preview background using
          light-theme CSS variables — that's the combination the
          `color='white'` variant was designed for. In dark page
          theme, the same variables flip and produce a slider that
          blends into the background. Before the externalization fix
          the bundled component-library was isolated from apps's
          theme context, which incidentally provided the same effect;
          this makes that intent explicit. */}
      <div className={moduleStyles.sliderContainer} data-theme="Light">
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
