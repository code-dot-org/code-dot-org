/** @file Crosshair and guides over visualization */

var TOOLTIP_MARGIN = 6;
var EDGE_MARGIN = 5;
var TEXT_RECT_WIDTH = 110;
var TEXT_RECT_HEIGHT = 21;
var TEXT_RECT_RADIUS = TEXT_RECT_HEIGHT / 3;
var TEXT_Y_OFFSET = -7;
var BETWEEN_RECT_MARGIN = 4;

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
    providers: React.PropTypes.arrayOf(React.PropTypes.func)
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
      height: tooltipCount * TEXT_RECT_HEIGHT + (tooltipCount-1) * BETWEEN_RECT_MARGIN
    };
  },

  /**
   * Given current properties, calculates the position for rendering the tooltip.
   * @returns {{rectX: number, rectY: number}}
   */
  getTooltipTopLeft() {
    var tooltipSize = this.getTooltipDimensions();
    var rectX = this.props.mouseX + TOOLTIP_MARGIN;
    if (rectX + tooltipSize.width + EDGE_MARGIN > this.props.width) {
      // This response gives a smooth horizontal reposition when near the edge
      rectX -= (rectX + tooltipSize.width + EDGE_MARGIN - this.props.width);
      // This response snaps the text to the other side when near the edge
      //rectX = this.props.mouseX - TOOLTIP_MARGIN - tooltipSize.width;
    }

    var rectY = this.props.mouseY + TOOLTIP_MARGIN;
    if (rectY + tooltipSize.height + EDGE_MARGIN > this.props.height) {
      rectY = this.props.mouseY - TOOLTIP_MARGIN - tooltipSize.height;
    }

    return {rectX: rectX, rectY: rectY};
  },

  isMouseInBounds() {
    return (this.props.mouseX >= 0) &&
        (this.props.mouseX <= this.props.width) &&
        (this.props.mouseY >= 0) &&
        (this.props.mouseY <= this.props.height);
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
        <g>
          <rect
              x={rectX}
              y={rectY}
              width={TEXT_RECT_WIDTH}
              height={TEXT_RECT_HEIGHT}
              rx={TEXT_RECT_RADIUS}
              ry={TEXT_RECT_RADIUS}
          />
          <text x={textX} y={textY}>
            {string}
          </text>
        </g>
      );
    });
  },

  render() {
    if (!this.isMouseInBounds() || !this.props.providers) {
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
