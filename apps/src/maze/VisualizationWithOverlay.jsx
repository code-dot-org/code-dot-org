import React from 'react';
import PropTypes from 'prop-types';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

export default function VisualizationWithOverlay({
  children,
  width,
  height,
  squareSize,
  rows,
  cols
}) {
  const viewWidth = squareSize * cols;
  const viewHeight = squareSize * rows;
  return (
    <ProtectedVisualizationDiv>
      <svg
        id="svgMazeParent"
        version="1.1"
        width={width}
        height={height}
        //viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        style={styles.svg}
      >
        <svg version="1.1" id="svgMaze">
          <g id="look">
            <path d="M 0,-15 a 15 15 0 0 1 15 15" />
            <path d="M 0,-35 a 35 35 0 0 1 35 35" />
            <path d="M 0,-55 a 55 55 0 0 1 55 55" />
          </g>
        </svg>
        {children}
      </svg>
    </ProtectedVisualizationDiv>
  );
}

VisualizationWithOverlay.propTypes = {
  children: PropTypes.node,
  width: PropTypes.number,
  height: PropTypes.number,
  squareSize: PropTypes.number,
  rows: PropTypes.number,
  cols: PropTypes.number
};
