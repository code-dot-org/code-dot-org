/** @file App Lab-specific Crosshair Overlay */

import PropTypes from 'prop-types';
import React from 'react';

import CrosshairOverlay from '../templates/CrosshairOverlay';

import {draggedElementDropPoint} from './gridUtils';

export default class AppLabCrosshairOverlay extends React.Component {
  static propTypes = {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: PropTypes.number,
    height: PropTypes.number,
    mouseX: PropTypes.number,
    mouseY: PropTypes.number,
  };

  render() {
    const dragPoint = draggedElementDropPoint();
    return (
      <CrosshairOverlay
        width={this.props.width}
        height={this.props.height}
        mouseX={dragPoint ? dragPoint.left : this.props.mouseX}
        mouseY={dragPoint ? dragPoint.top : this.props.mouseY}
      />
    );
  }
}
