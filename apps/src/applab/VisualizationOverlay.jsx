var applabMsg = require('./locale');
var CrosshairOverlay = require('./CrosshairOverlay.jsx');

module.exports = React.createClass({
  propTypes: {
    appWidth: React.PropTypes.number.isRequired,
    appHeight: React.PropTypes.number.isRequired,
    scale: React.PropTypes.number.isRequired,
    isApplabRunning: React.PropTypes.bool.isRequired
  },

  getDefaultProps: function () {
    return {
      svgStyle: {
        pointerEvents: 'none'
      }
    };
  },

  getInitialState: function () {
    return {
      mouseX: -1,
      mouseY: -1
    };
  },

  componentDidMount: function() {
    this.recalculateTransformAtScale(this.props.scale);
    document.addEventListener('mousemove', this.onSvgMouseMove);
  },

  componentWillReceiveProps: function (nextProps) {
    this.recalculateTransformAtScale(nextProps.scale);
  },

  componentWillUnmount: function() {
    document.removeEventListener('mousemove', this.onSvgMouseMove);
  },

  isMouseInVisualization: function () {
    return (this.state.mouseX >= 0) &&
        (this.state.mouseX <= this.props.appWidth) &&
        (this.state.mouseY >= 0) &&
        (this.state.mouseY <= this.props.appHeight);
  },

  shouldShowCrosshair: function () {
    return !this.props.isApplabRunning && this.isMouseInVisualization();
  },

  onSvgMouseMove: function (e) {
    var svg = React.findDOMNode(this.refs.svg_);
    if (!svg) {
      return;
    }

    // TODO: Make one point object and reuse it
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    pt = pt.matrixTransform(this.screenSpaceToAppSpaceTransform);

    this.setState({
      mouseX: pt.x,
      mouseY: pt.y
    });
  },

  render: function() {
    var overlayComponent;
    if (this.shouldShowCrosshair()) {
      overlayComponent = <CrosshairOverlay x={this.state.mouseX}
                                           y={this.state.mouseY}
                                           appWidth={this.props.appWidth}
                                           appHeight={this.props.appHeight} />;
    }

    var viewBox = "0 0 " + this.props.appWidth + " " + this.props.appHeight;

    return <svg ref="svg_"
                width={this.props.appWidth} height={this.props.appHeight}
                viewBox={viewBox}
                style={this.props.svgStyle}>{overlayComponent}</svg>;
  },

  recalculateTransformAtScale: function (scale) {
    var svg = React.findDOMNode(this.refs.svg_);
    var svgRect = svg.getBoundingClientRect();
    var newTransform = svg.createSVGMatrix()
        .scale(1 / scale)
        .translate(-svgRect.left, -svgRect.top);
    this.screenSpaceToAppSpaceTransform = newTransform;
  }
});
