var React = require('react');
var applabMsg = require('./locale');

var CROSSHAIR_RADIUS = 5;
var CROSSHAIR_MARGIN = 5;
var COORDINATE_TEXT_X_MARGIN = 0; // Not needed when text is centered
var COORDINATE_TEXT_Y_MARGIN = 20;

module.exports = React.createClass({
  propTypes: {
  },

  getInitialState: function() {
    return {};
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
    return <g className="crosshair">
      <line className="guide vertical"
            x1={this.props.x}
            y1={this.props.y - (CROSSHAIR_RADIUS + CROSSHAIR_MARGIN)}
            x2={this.props.x}
            y2="0"/>
      <line className="guide horizontal"
            x1={this.props.x - (CROSSHAIR_RADIUS + CROSSHAIR_MARGIN)}
            y1={this.props.y}
            x2="0"
            y2={this.props.y}/>
      <line className="cursor vertical"
            x1={this.props.x}
            y1={this.props.y - CROSSHAIR_RADIUS}
            x2={this.props.x}
            y2={this.props.y + CROSSHAIR_RADIUS}/>
      <line className="cursor horizontal"
            x1={this.props.x - CROSSHAIR_RADIUS}
            y1={this.props.y}
            x2={this.props.x + CROSSHAIR_RADIUS}
            y2={this.props.y}/>
      <text x={this.props.x + COORDINATE_TEXT_X_MARGIN}
            y={this.props.y + COORDINATE_TEXT_Y_MARGIN}
          >{this.getCoordinateText()}</text>
    </g>;
  }
});
