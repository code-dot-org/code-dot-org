var applabMsg = require('./locale');

var CROSSHAIR_MARGIN = 6;
var TEXT_RECT_WIDTH = 104;
var TEXT_RECT_HEIGHT = 21;
var TEXT_RECT_RADIUS = TEXT_RECT_HEIGHT / 3;
var TEXT_Y_OFFSET = -7;

module.exports = React.createClass({
  propTypes: {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    appWidth: React.PropTypes.number.isRequired,
    appHeight: React.PropTypes.number.isRequired
  },

  getDefaultProps: function () {
    var guideStyle = {
      stroke: '#aaa',
      strokeWidth: 1.8,
      strokeDasharray: 6.5
    };

    var textStyle = {
      textAnchor: 'middle'
    };

    var textBubbleStyle = {
      stroke: '#bdc3c7',
      strokeWidth: 2,
      fill: 'rgba(255,255,255,0.8)'
    };

    return {
      guideStyle: guideStyle,
      textStyle: textStyle,
      textBubbleStyle: textBubbleStyle
    };
  },

  getCoordinateText: function () {
    return "x: " + Math.floor(this.props.x) +
        ", y: " + Math.floor(this.props.y);
  },

  // Draw:
  //   Horizontal line from cursor to left edge.
  //   Vertical line from to cursor to top edge.
  //     Note - swap (x1,y1) <-> (x2, y2) to reverse the anchoring for the
  //     dotted line effect.
  //   Coordinate text
  render: function() {
    var coordinateText = this.getCoordinateText();
    var rectX = this.props.x + CROSSHAIR_MARGIN;
    if (rectX + TEXT_RECT_WIDTH > this.props.appWidth) {
      rectX = this.props.x - CROSSHAIR_MARGIN - TEXT_RECT_WIDTH;
    }

    var rectY = this.props.y + CROSSHAIR_MARGIN;
    if (rectY + TEXT_RECT_HEIGHT > this.props.appHeight) {
      rectY = this.props.y - CROSSHAIR_MARGIN - TEXT_RECT_HEIGHT;
    }

    var textX = rectX + TEXT_RECT_WIDTH / 2;
    var textY = rectY + TEXT_RECT_HEIGHT + TEXT_Y_OFFSET;

    return <g>
      <line style={this.props.guideStyle}
            x1={this.props.x}
            y1={this.props.y - CROSSHAIR_MARGIN}
            x2={this.props.x}
            y2="0"/>
      <line style={this.props.guideStyle}
            x1={this.props.x - CROSSHAIR_MARGIN}
            y1={this.props.y}
            x2="0"
            y2={this.props.y}/>
      <rect style={this.props.textBubbleStyle}
            x={rectX}
            y={rectY}
            width={TEXT_RECT_WIDTH}
            height={TEXT_RECT_HEIGHT}
            rx={TEXT_RECT_RADIUS}
            ry={TEXT_RECT_RADIUS} />
      <text style={this.props.textStyle}
            x={textX}
            y={textY}
          >{coordinateText}</text>
    </g>;
  }
});
