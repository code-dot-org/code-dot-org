/** @file Crosshair and guides over visualization */
import React from 'react';
export const CROSSHAIR_MARGIN = 6;

/**
 * Crosshair and Guides layered over the play space.
 * Should be rendered inside a VisualizationOverlay.
 * @constructor
 */
const CrosshairOverlay = React.createClass({
  propTypes: {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    mouseX: React.PropTypes.number,
    mouseY: React.PropTypes.number
  },

  isMouseInBounds() {
    return (this.props.mouseX >= 0) &&
        (this.props.mouseX <= this.props.width) &&
        (this.props.mouseY >= 0) &&
        (this.props.mouseY <= this.props.height);
  },

  render() {
    if (!this.isMouseInBounds()) {
      return null;
    }

    return (
      <g className="crosshair-overlay">
        <line
            x1={this.props.mouseX}
            y1={this.props.mouseY - CROSSHAIR_MARGIN}
            x2={this.props.mouseX}
            y2={0}
        />
        <line
            x1={this.props.mouseX - CROSSHAIR_MARGIN}
            y1={this.props.mouseY}
            x2={0}
            y2={this.props.mouseY}
        />
      </g>
    );
  }
});
export default CrosshairOverlay;
