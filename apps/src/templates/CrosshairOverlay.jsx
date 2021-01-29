/** @file Crosshair and guides over visualization */
import PropTypes from 'prop-types';
import React from 'react';
import {isPointInBounds} from '../util/grid';
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
    mouseY: PropTypes.number,
    flip: PropTypes.bool
  };

  render() {
    if (
      !isPointInBounds(
        this.props.mouseX,
        this.props.mouseY,
        this.props.width,
        this.props.height
      )
    ) {
      return null;
    }

    const flip = this.props.flip;

    return (
      <svg className="crosshair-overlay">
        <line
          x1={this.props.mouseX}
          y1={flip ? this.props.height : 0}
          x2={this.props.mouseX}
          y2={this.props.mouseY - CROSSHAIR_MARGIN * (flip ? -1 : 1)}
          style={styles.line}
        />
        <line
          x1={0}
          y1={this.props.mouseY}
          x2={this.props.mouseX - CROSSHAIR_MARGIN}
          y2={this.props.mouseY}
          style={styles.line}
        />
      </svg>
    );
  }
}
