import React, {useMemo} from 'react';

import MazeVisualization from '@cdo/apps/maze/Visualization';

import moduleStyles from './neighborhood.module.scss';

interface NeighborhoodVisualizationProps {
  className?: string;
  isDarkMode: boolean;
  useProtectedDiv?: boolean;
}
const ICON_PATH = '/blockly/media/turtle/';

const NeighborhoodVisualization: React.FunctionComponent<
  NeighborhoodVisualizationProps
> = ({className, isDarkMode, useProtectedDiv = true}) => {
  const fullIconPath = isDarkMode
    ? ICON_PATH + 'icons_white.png'
    : ICON_PATH + 'icons.png';

  // In lab2 labs we often want to be able to unmount components, so we
  // have the option to not use the ProtectedVisualizationDiv that MazeVisualization uses.
  const visualizationComponent = useMemo(() => {
    if (useProtectedDiv) {
      return <MazeVisualization />;
    } else {
      return (
        <div id="visualization">
          <svg version="1.1" id="svgMaze">
            <g id="look">
              <path d="M 0,-15 a 15 15 0 0 1 15 15" />
              <path d="M 0,-35 a 35 35 0 0 1 35 35" />
              <path d="M 0,-55 a 55 55 0 0 1 55 55" />
            </g>
          </svg>
        </div>
      );
    }
  }, [useProtectedDiv]);

  return (
    <div className={className}>
      <div
        className={moduleStyles.neighborhoodPreviewBackground}
        style={styles.neighborhoodBackground}
      >
        {visualizationComponent}
      </div>
      <svg
        id="slider"
        version="1.1"
        width="150"
        height="50"
        className={moduleStyles.slider}
      >
        {/* Slow icon. */}
        <clipPath id="slowClipPath">
          <rect width="26" height="12" x="5" y="14" />
        </clipPath>
        <image
          xlinkHref={fullIconPath}
          height="42"
          width="84"
          x="-21"
          y="-10"
          clipPath="url(#slowClipPath)"
        />
        {/* Fast icon. */}
        <clipPath id="fastClipPath">
          <rect width="26" height="16" x="120" y="10" />
        </clipPath>
        <image
          xlinkHref={fullIconPath}
          height="42"
          width="84"
          x="120"
          y="-11"
          clipPath="url(#fastClipPath)"
        />
      </svg>
    </div>
  );
};

const styles = {
  neighborhoodBackground: {
    // CSS Modules don't support loading webpack assets, so we have to use inline styles.
    backgroundImage: 'url("/blockly/media/javalab/Neighborhood.png")',
  },
};

export default NeighborhoodVisualization;
