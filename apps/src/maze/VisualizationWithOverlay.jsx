import React from 'react';
import PropTypes from 'prop-types';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import {VisualizationOverlay} from '../templates/VisualizationOverlay';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';
import {connect} from 'react-redux';

export function UnconnectedVisualizationWithOverlay({
  width,
  height,
  squareSize,
  rows,
  cols,
  leftWidth
}) {
  //const onMouseMove = (mouseX, mouseY) => this.setState({mouseX, mouseY});
  console.log(`left width is ${leftWidth}`);
  const viewWidth = squareSize * cols;
  const viewHeight = squareSize * rows;
  return (
    <ProtectedVisualizationDiv>
      {/* <span style={styles.mazeContainer}> */}
        {/* <svg
        id="svgMazeParent"
        version="1.1"
        width={width}
        height={height}
        //viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        //style={styles.svg}
      > */}
        <svg version="1.1" id="svgMaze" style={styles.maze}>
          <g id="look">
            <path d="M 0,-15 a 15 15 0 0 1 15 15" />
            <path d="M 0,-35 a 35 35 0 0 1 35 35" />
            <path d="M 0,-55 a 55 55 0 0 1 55 55" />
          </g>
        </svg>

        <VisualizationOverlay
          width={leftWidth}
          height={leftWidth}
          areOverlaysVisible={true}
          areRunStateOverlaysVisible={true}
          style={styles.overlay}
        >
          <CrosshairOverlay />
          <TooltipOverlay providers={[coordinatesProvider(false, false)]} />
        </VisualizationOverlay>
        {/* </svg> */}
      {/* </span> */}
    </ProtectedVisualizationDiv>
  );
}

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: 'scale(1.0)'
  },
  maze: {
    position: 'absolute',
    top: 0,
    left: 0
  }
};

UnconnectedVisualizationWithOverlay.propTypes = {
  children: PropTypes.node,
  width: PropTypes.number,
  height: PropTypes.number,
  squareSize: PropTypes.number,
  rows: PropTypes.number,
  cols: PropTypes.number,
  //populated by redux
  leftWidth: PropTypes.number
};

export default connect(state => ({
  leftWidth: state.javalab.leftWidth
}))(UnconnectedVisualizationWithOverlay);
