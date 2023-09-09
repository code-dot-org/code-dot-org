import React from 'react';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

export default function Visualization() {
  return (
    <ProtectedVisualizationDiv>
      <svg version="1.1" id="svgMaze">
        <g id="look">
          <path d="M 0,-15 a 15 15 0 0 1 15 15" />
          <path d="M 0,-35 a 35 35 0 0 1 35 35" />
          <path d="M 0,-55 a 55 55 0 0 1 55 55" />
        </g>
      </svg>
    </ProtectedVisualizationDiv>
  );
}
