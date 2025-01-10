import PropTypes from 'prop-types';
import React from 'react';

import ProtectedVisualizationDiv, {
  VISUALIZATION_DIV_ID,
} from '@cdo/apps/templates/ProtectedVisualizationDiv';

// In lab2 labs we often want to be able to unmount components, so we
// include the option to not use ProtectedVisualizationDiv.
const Visualization = function ({useProtectedDiv = true}) {
  const innerComponent = (
    <svg version="1.1" id="svgMaze">
      <g id="look">
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
