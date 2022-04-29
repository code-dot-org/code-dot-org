import React from 'react';
import PropTypes from 'prop-types';
import {
  VISUALIZATION_DIV_ID,
  isResponsiveFromState
} from '../templates/ProtectedVisualizationDiv';
import {VisualizationOverlay} from '../templates/VisualizationOverlay';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';
import {connect} from 'react-redux';
import classNames from 'classnames';

export function UnconnectedVisualizationWithOverlay({
  width,
  height,
  squareSize,
  rows,
  cols,
  leftWidth,
  isResponsive
}) {
  //const onMouseMove = (mouseX, mouseY) => this.setState({mouseX, mouseY});
  return (
    <div
      id={VISUALIZATION_DIV_ID}
      className={classNames({responsive: isResponsive})}
    >
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
    </div>
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
  leftWidth: PropTypes.number,
  isResponsive: PropTypes.bool
};

export default connect(state => ({
  leftWidth: state.javalab.leftWidth,
  isResponsive: isResponsiveFromState(state)
}))(UnconnectedVisualizationWithOverlay);
