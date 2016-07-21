/** @file App Lab-specific Crosshair Overlay */

import React from 'react';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import { draggedElementDropPoint } from './gridUtils';

const AppLabCrosshairOverlay = React.createClass({
  propTypes: {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    mouseX: React.PropTypes.number,
    mouseY: React.PropTypes.number
  },

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
});
export default AppLabCrosshairOverlay;
