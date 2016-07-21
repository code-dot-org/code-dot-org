/** @file Crosshair and guides over visualization */
var React = require('react');

import { isMouseInBounds } from '../applab/gridUtils';

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
let TooltipOverlay = React.createClass({
  propTypes: {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    mouseX: React.PropTypes.number,
    mouseY: React.PropTypes.number,
    // Set of tooltip text provider functions.  See the end of this file for examples.
    providers: React.PropTypes.arrayOf(React.PropTypes.func),
    // Normally the tooltip is below the curosr
    tooltipAboveCursor: React.PropTypes.bool
  },

  getTooltipStrings() {
    return (this.props.providers || [])
        .map(provider => provider(this.props))
        .filter(s => typeof s === 'string');
  },

  /**
   * Simple getter for tooltip dimensions, useful to override in child class.
   * @returns {{width: number, height: number}}
   * @private
   */
  getTooltipDimensions() {
    var tooltipCount = this.getTooltipStrings().length;
    return {
      width: TEXT_RECT_WIDTH,
      height: tooltipCount * TEXT_RECT_HEIGHT + Math.max(0, tooltipCount-1) * BETWEEN_RECT_MARGIN
    };
  },

  /**
   * Given current properties, calculates the position for rendering the tooltip.
   * @returns {{rectX: number, rectY: number}}
   */
  getTooltipTopLeft() {
    var tooltipSize = this.getTooltipDimensions();
    var rectX, rectY;
    rectX = this.props.mouseX + TOOLTIP_MARGIN;
    if (rectX + tooltipSize.width + EDGE_MARGIN > this.props.width) {
      // This response gives a smooth horizontal reposition when near the edge
      rectX -= (rectX + tooltipSize.width + EDGE_MARGIN - this.props.width);
      // This response snaps the text to the other side when near the edge
      //rectX = this.props.mouseX - TOOLTIP_MARGIN - tooltipSize.width;
    }

    var abovePosition = this.props.mouseY - TOOLTIP_MARGIN - tooltipSize.height;
    var belowPosition = this.props.mouseY + TOOLTIP_MARGIN;
    if (belowPosition + tooltipSize.height + TOOLTIP_MARGIN > this.props.height) {
      rectY = abovePosition;
    } else if (abovePosition - TOOLTIP_MARGIN < 0) {
      rectY = belowPosition;
    } else if (this.props.tooltipAboveCursor) {
      rectY = abovePosition;
    } else {
      rectY = belowPosition;
    }

    return {rectX: rectX, rectY: rectY};
  },

  renderTooltips() {
    var bubbleCoordinates = this.getTooltipTopLeft();
    var rectX = bubbleCoordinates.rectX;
    var textX = rectX + TEXT_RECT_WIDTH / 2;

    return this.getTooltipStrings().map((string, index) => {
      var indexYOffset = index * (TEXT_RECT_HEIGHT + BETWEEN_RECT_MARGIN);
      var rectY = bubbleCoordinates.rectY + indexYOffset;
      var textY = rectY + TEXT_RECT_HEIGHT + TEXT_Y_OFFSET;
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
  },

  render() {
    if (!isMouseInBounds(this.props.mouseX, this.props.mouseY,
        this.props.width, this.props.height) ||
      !this.props.providers || !this.props.providers.length) {
      return null;
    }
    return <g className="tooltip-overlay">{this.renderTooltips()}</g>;
  }
});
export default TooltipOverlay;

// A 'tip provider is a function that will generate an appropriate string label
// for a tooltip, given the TooltipOverlay's props.  It can return a string,
// which will be displayed, or null/undefined which will result in the tooltip
// being omitted from the stack.

/**
 * Example provider generator.  This function creates a provider that always
 * displays a static string, which you provide as an argument..
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
export function coordinatesProvider() {
  return (props) => `x: ${Math.floor(props.mouseX)}, y: ${Math.floor(props.mouseY)}`;
}
