/** @file Crosshair and guides over visualization */

var CROSSHAIR_MARGIN = 6;
var EDGE_MARGIN = 5;
var TEXT_RECT_WIDTH = 110;
var TEXT_RECT_HEIGHT = 21;
var TEXT_RECT_RADIUS = TEXT_RECT_HEIGHT / 3;
var TEXT_Y_OFFSET = -7;

/**
 * Crosshair and Guides layered over the play space.
 * Should be rendered inside a VisualizationOverlay.
 * @constructor
 */
let CrosshairOverlay = React.createClass({
  propTypes: {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    mouseX: React.PropTypes.number,
    mouseY: React.PropTypes.number
  },

  /**
   * Given current properties, calculates the position for rendering the tooltip.
   * @returns {{rectX: number, rectY: number}}
   */
  getBubbleCoordinates() {
    var tooltipSize = this.getTooltipDimensions();
    var rectX = this.props.mouseX + CROSSHAIR_MARGIN;
    if (rectX + tooltipSize.width + EDGE_MARGIN > this.props.width) {
      // This response gives a smooth horizontal reposition when near the edge
      rectX -= (rectX + tooltipSize.width + EDGE_MARGIN - this.props.width);
      // This response snaps the text to the other side when near the edge
      //rectX = this.props.mouseX - CROSSHAIR_MARGIN - tooltipSize.width;
    }

    var rectY = this.props.mouseY + CROSSHAIR_MARGIN;
    if (rectY + tooltipSize.height + EDGE_MARGIN > this.props.height) {
      rectY = this.props.mouseY - CROSSHAIR_MARGIN - tooltipSize.height;
    }

    return {rectX: rectX, rectY: rectY};
  },

  /**
   * Simple getter for tooltip dimensions, useful to override in child class.
   * @returns {{width: number, height: number}}
   * @private
   */
  getTooltipDimensions() {
    return {
      width: TEXT_RECT_WIDTH,
      height: TEXT_RECT_HEIGHT
    };
  },

  getCoordinateText() {
    return "x: " + Math.floor(this.props.mouseX) +
        ", y: " + Math.floor(this.props.mouseY);
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

    var bubbleCoordinates = this.getBubbleCoordinates();
    var rectX = bubbleCoordinates.rectX;
    var rectY = bubbleCoordinates.rectY;

    var textX = rectX + TEXT_RECT_WIDTH / 2;
    var textY = rectY + TEXT_RECT_HEIGHT + TEXT_Y_OFFSET;

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
        <rect
            x={rectX}
            y={rectY}
            width={TEXT_RECT_WIDTH}
            height={TEXT_RECT_HEIGHT}
            rx={TEXT_RECT_RADIUS}
            ry={TEXT_RECT_RADIUS}
        />
        <text x={textX} y={textY}>
          {this.getCoordinateText()}
        </text>
      </g>
    );
  }
});
export default CrosshairOverlay;
