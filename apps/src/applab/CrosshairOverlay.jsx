var applabMsg = require('./locale');

var CROSSHAIR_RADIUS = 5;
var CROSSHAIR_MARGIN = 5;
var COORDINATE_TEXT_X_MARGIN = 0; // Not needed when text is centered
var COORDINATE_TEXT_Y_MARGIN = 20;

module.exports = React.createClass({
  propTypes: {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
  },

  getDefaultProps: function () {
    var cursorStyle = {
      stroke: '#333',
      strokeWidth: 2
    };

    var cursorOutlineStyle = {
      stroke: '#ddd',
      strokeWidth: 4
    };

    var guideStyle = {
      stroke: '#aaa',
      strokeWidth: 1.8,
      strokeDasharray: 6.5
    };

    var textStyle = {
      textAnchor: 'middle'
    };

    var textOutlineStyle = $.extend({}, textStyle, {
      stroke: 'white',
      strokeWidth: 10,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'none'
    });

    return {
      cursorStyle: cursorStyle,
      cursorOutlineStyle: cursorOutlineStyle,
      guideStyle: guideStyle,
      textStyle: textStyle,
      textOutlineStyle: textOutlineStyle
    };
  },

  getCoordinateText: function () {
    return "(x: " + Math.floor(this.props.x) +
        ", y: " + Math.floor(this.props.y) + ")";
  },

  // Draw:
  //   Horizontal line from cursor to left edge.
  //   Vertical line from to cursor to top edge.
  //     Note - swap (x1,y1) <-> (x2, y2) to reverse the anchoring for the
  //     dotted line effect.
  //   Cursor
  //   Coordinate text
  render: function() {
    var coordinateText = this.getCoordinateText();
    return <g>
      <line style={this.props.guideStyle}
            x1={this.props.x}
            y1="0"
            x2={this.props.x}
            y2={this.props.y - (CROSSHAIR_RADIUS + CROSSHAIR_MARGIN)}/>
      <line style={this.props.guideStyle}
            x1="0"
            y1={this.props.y}
            x2={this.props.x - (CROSSHAIR_RADIUS + CROSSHAIR_MARGIN)}
            y2={this.props.y}/>
      <line style={this.props.cursorOutlineStyle}
            x1={this.props.x}
            y1={this.props.y - CROSSHAIR_RADIUS - 1}
            x2={this.props.x}
            y2={this.props.y + CROSSHAIR_RADIUS + 1}/>
      <line style={this.props.cursorOutlineStyle}
            x1={this.props.x - CROSSHAIR_RADIUS - 1}
            y1={this.props.y}
            x2={this.props.x + CROSSHAIR_RADIUS + 1}
            y2={this.props.y}/>
      <line style={this.props.cursorStyle}
            x1={this.props.x}
            y1={this.props.y - CROSSHAIR_RADIUS}
            x2={this.props.x}
            y2={this.props.y + CROSSHAIR_RADIUS}/>
      <line style={this.props.cursorStyle}
            x1={this.props.x - CROSSHAIR_RADIUS}
            y1={this.props.y}
            x2={this.props.x + CROSSHAIR_RADIUS}
            y2={this.props.y}/>
      <text style={this.props.textOutlineStyle}
            x={this.props.x + COORDINATE_TEXT_X_MARGIN}
            y={this.props.y + COORDINATE_TEXT_Y_MARGIN}
          >{coordinateText}</text>
      <text style={this.props.textStyle}
            x={this.props.x + COORDINATE_TEXT_X_MARGIN}
            y={this.props.y + COORDINATE_TEXT_Y_MARGIN}
          >{coordinateText}</text>
    </g>;
  }
});
