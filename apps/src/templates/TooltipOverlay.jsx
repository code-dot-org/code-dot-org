/** @file Crosshair and guides over visualization */
import PropTypes from 'prop-types';
import React from 'react';

import {isPointInBounds} from '../applab/gridUtils';

const TOOLTIP_MARGIN = 6;
const EDGE_MARGIN = 5;
export const TEXT_RECT_WIDTH = 110;
export const TEXT_RECT_HEIGHT = 21;
export const TEXT_RECT_RADIUS = TEXT_RECT_HEIGHT / 3;
export const BETWEEN_RECT_MARGIN = 4;
const TEXT_Y_OFFSET = -7;

export const styles = {
  text: {
    textAnchor: 'middle'
  },
  rect: {
    stroke: '#bdc3c7',
    strokeWidth: 2,
    fill: 'rgba(255,255,255,0.8)'
  }
};

/**
 * Renders a set of tooltips layered over the play space.
 * Should be rendered inside a VisualizationOverlay.
 * @constructor
 */
export default class TooltipOverlay extends React.Component {
  static propTypes = {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: PropTypes.number,
    height: PropTypes.number,
    mouseX: PropTypes.number,
    mouseY: PropTypes.number,
    // Set of tooltip text provider functions.  See the end of this file for examples.
    providers: PropTypes.arrayOf(PropTypes.func),
    // Normally the tooltip is below the curosr
    tooltipAboveCursor: PropTypes.bool
  };

  getTooltipStrings() {
    return (this.props.providers || [])
      .map(provider => provider(this.props))
      .filter(s => typeof s === 'string');
  }

  /**
   * Simple getter for tooltip dimensions, useful to override in child class.
   * @returns {{width: number, height: number}}
   * @private
   */
  getTooltipDimensions() {
    const tooltipCount = this.getTooltipStrings().length;
    return {
      width: TEXT_RECT_WIDTH,
      height:
        tooltipCount * TEXT_RECT_HEIGHT +
        Math.max(0, tooltipCount - 1) * BETWEEN_RECT_MARGIN
    };
  }

  /**
   * Given current properties, calculates the position for rendering the tooltip.
   * @returns {{rectX: number, rectY: number}}
   */
  getTooltipTopLeft() {
    const tooltipSize = this.getTooltipDimensions();
    let rectX, rectY;
    rectX = this.props.mouseX + TOOLTIP_MARGIN;
    if (rectX + tooltipSize.width + EDGE_MARGIN > this.props.width) {
      // This response gives a smooth horizontal reposition when near the edge
      rectX -= rectX + tooltipSize.width + EDGE_MARGIN - this.props.width;
      // This response snaps the text to the other side when near the edge
      //rectX = this.props.mouseX - TOOLTIP_MARGIN - tooltipSize.width;
    }

    const abovePosition =
      this.props.mouseY - TOOLTIP_MARGIN - tooltipSize.height;
    const belowPosition = this.props.mouseY + TOOLTIP_MARGIN;
    if (
      belowPosition + tooltipSize.height + TOOLTIP_MARGIN >
      this.props.height
    ) {
      rectY = abovePosition;
    } else if (abovePosition - TOOLTIP_MARGIN < 0) {
      rectY = belowPosition;
    } else if (this.props.tooltipAboveCursor) {
      rectY = abovePosition;
    } else {
      rectY = belowPosition;
    }

    return {rectX: rectX, rectY: rectY};
  }

  renderTooltips() {
    const bubbleCoordinates = this.getTooltipTopLeft();
    const rectX = bubbleCoordinates.rectX;
    const textX = rectX + TEXT_RECT_WIDTH / 2;

    return this.getTooltipStrings().map((string, index) => {
      const indexYOffset = index * (TEXT_RECT_HEIGHT + BETWEEN_RECT_MARGIN);
      const rectY = bubbleCoordinates.rectY + indexYOffset;
      const textY = rectY + TEXT_RECT_HEIGHT + TEXT_Y_OFFSET;
      return (
        <g key={index}>
          <rect
            x={rectX}
            y={rectY}
            width={TEXT_RECT_WIDTH}
            height={TEXT_RECT_HEIGHT}
            rx={TEXT_RECT_RADIUS}
            ry={TEXT_RECT_RADIUS}
            style={styles.rect}
          />
          <text x={textX} y={textY} style={styles.text}>
            {string}
          </text>
        </g>
      );
    });
  }

  render() {
    if (
      !isPointInBounds(
        this.props.mouseX,
        this.props.mouseY,
        this.props.width,
        this.props.height
      ) ||
      !this.props.providers ||
      !this.props.providers.length
    ) {
      return null;
    }
    return <svg className="tooltip-overlay">{this.renderTooltips()}</svg>;
  }
}

// A 'tip provider is a function that will generate an appropriate string label
// for a tooltip, given the TooltipOverlay's props.  It can return a string,
// which will be displayed, or null/undefined which will result in the tooltip
// being omitted from the stack.

/**
 * Example provider generator.  This function creates a provider that always
 * displays a static string, which you provide as an argument.
 * @param {!string} label
 * @returns {function(): string}
 */
export function textProvider(label) {
  return () => label;
}

/**
 * Simple provider that formats and renders the mouse coordinates.
 * @returns {function(): string}
 */
export function coordinatesProvider(flip = false, isRtl = false) {
  return props => {
    const y = flip ? props.height - props.mouseY : props.mouseY;
    if (isRtl) {
      // We have to use unicode to explicitly set the SVG text to LTR when the document is using RTL
      return `\u202A${Math.round(y)} :y, ${Math.round(props.mouseX)} :x\u202C`;
    } else {
      return `x: ${Math.round(props.mouseX)}, y: ${Math.round(y)}`;
    }
  };
}
