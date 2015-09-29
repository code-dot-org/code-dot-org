var React = require('react');
var applabMsg = require('./locale');
var CrosshairOverlay = require('./CrosshairOverlay.jsx');

module.exports = React.createClass({
  propTypes: {
  },

  getInitialState: function() {
    return {
      mouseX: 0,
      mouseY: 0
    };
  },

  onSvgMouseMove: function (e) {
    var svg = React.findDOMNode(this.refs.svg_);
    var screenToSvg = svg.getScreenCTM().inverse();
    var unscale = svg.createSVGMatrix().scale(1 / this.props.scale);
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    pt = pt.matrixTransform(screenToSvg).matrixTransform(unscale);

    this.setState({
      mouseX: pt.x,
      mouseY: pt.y
    });
  },

  render: function() {
    return <svg ref="svg_">
      <CrosshairOverlay x={this.state.mouseX} y={this.state.mouseY} />
    </svg>;
  },

  componentDidMount: function() {
    document.addEventListener('mousemove', this.onSvgMouseMove);
  },

  componentWillUnmount: function() {
    document.removeEventListener('mousemove', this.onSvgMouseMove);
  }
});
