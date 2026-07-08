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
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const nav = new MazeKeyboardNavigation(svg);
    return () => nav.destroy();
  }, []);

  // The svg is both the maze surface and the keyboard-nav host
  // role=application is the right ARIA role for a widget that owns its keys
  const innerComponent = (
    <svg
      id={SVG_ID}
      ref={svgRef}
      tabIndex={0}
      role="application"
      aria-label={NAV_HINT}
    >
      <g id={LOOK_ID}>
        <path d="M 0,-15 a 15 15 0 0 1 15 15" />
        <path d="M 0,-35 a 35 35 0 0 1 35 35" />
        <path d="M 0,-55 a 55 55 0 0 1 55 55" />
      </g>
    </svg>
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
