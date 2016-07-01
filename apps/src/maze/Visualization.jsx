import React from 'react';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var Visualization = function () {
  return (
    <ProtectedVisualizationDiv>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze">
        <g id="look">
          <path d="M 0,-15 a 15 15 0 0 1 15 15" />
          <path d="M 0,-35 a 35 35 0 0 1 35 35" />
          <path d="M 0,-55 a 55 55 0 0 1 55 55" />
        </g>
      </svg>
    </ProtectedVisualizationDiv>
  );
};
module.exports = Visualization;
