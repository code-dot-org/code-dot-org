/** @file Crosshair and guides over visualization */
import React, {PropTypes} from 'react';
import { isPointInBounds } from '../util/grid';
export const CROSSHAIR_MARGIN = 6;

export const styles = {
  line: {
    stroke: '#aaa',
    strokeWidth: 1.8,
    strokeDasharray: 6.5
  }
};

/**
 * Crosshair and Guides layered over the play space.
 * Should be rendered inside a VisualizationOverlay.
 * @constructor
 */
export default class CrosshairOverlay extends React.Component {
  static propTypes = {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: PropTypes.number,
    height: PropTypes.number,
    mouseX: PropTypes.number,
    mouseY: PropTypes.number
  };

  render() {
    if (!isPointInBounds(this.props.mouseX, this.props.mouseY,
      this.props.width, this.props.height)) {
      return null;
    }

    return (
      <g className="crosshair-overlay">
        <line
          x1={this.props.mouseX}
          y1={this.props.mouseY - CROSSHAIR_MARGIN}
          x2={this.props.mouseX}
          y2={0}
          style={styles.line}
        />
        <line
          x1={this.props.mouseX - CROSSHAIR_MARGIN}
          y1={this.props.mouseY}
          x2={0}
          y2={this.props.mouseY}
          style={styles.line}
        />
      </g>
    );
  }
}
