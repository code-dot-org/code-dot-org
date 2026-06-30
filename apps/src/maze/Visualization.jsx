import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';

import ProtectedVisualizationDiv, {
  VISUALIZATION_DIV_ID,
} from '@cdo/apps/templates/ProtectedVisualizationDiv';

import {LOOK_ID, SVG_ID} from './constants';
import MazeKeyboardNavigation from './keyboardNavigation';

const NAV_HINT =
  'Maze visualization. Press Enter to walk the path with the arrow keys. Press Escape to exit.';

// In lab2 labs we often want to be able to unmount components, so we
// include the option to not use ProtectedVisualizationDiv.
const Visualization = function ({useProtectedDiv = true}) {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const svg = svgRef.current;
    if (!wrapper || !svg) return undefined;
    const nav = new MazeKeyboardNavigation(wrapper, svg);
    return () => nav.destroy();
  }, []);

  const innerComponent = (
    <div
      ref={wrapperRef}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="application"
      aria-label={NAV_HINT}
      style={{display: 'inline-block'}}
    >
      <svg id={SVG_ID} ref={svgRef}>
        <g id={LOOK_ID}>
          <path d="M 0,-15 a 15 15 0 0 1 15 15" />
          <path d="M 0,-35 a 35 35 0 0 1 35 35" />
          <path d="M 0,-55 a 55 55 0 0 1 55 55" />
        </g>
      </svg>
    </div>
  );
  return useProtectedDiv ? (
    <ProtectedVisualizationDiv>{innerComponent}</ProtectedVisualizationDiv>
  ) : (
    <div id={VISUALIZATION_DIV_ID}>{innerComponent}</div>
  );
};

Visualization.propTypes = {
  useProtectedDiv: PropTypes.bool,
};
module.exports = Visualization;
export default Visualization;
