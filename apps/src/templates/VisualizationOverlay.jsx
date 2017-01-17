/** @file SVG Visualization Overlay */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Overlay for the play space that helps render additional UI (like the
 * crosshair and element tooltips).  Main responsibilities for this class are:
 *   Rendering root SVG for overlays
 *   Efficiently transforming mouse position into app-space
 * @constructor
 */
export let VisualizationOverlay = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    areOverlaysVisible: React.PropTypes.bool.isRequired,
    onMouseMove: React.PropTypes.func,
    children: React.PropTypes.node,
  },

  getInitialState: () => ({
    /** @type {number} */
    mouseX: -1,
    /** @type {number} */
    mouseY: -1,
    /** @type {SVGMatrix} */
    screenSpaceToAppSpaceTransform: null
  }),

  componentDidMount() {
    /** @private {SVGPoint} Build a reusable position point for efficient transforms */
    this.mousePos_ = this.refs.root.createSVGPoint();
    this.recalculateTransform();

    // Note: This is currently used within a ProtectedStatefulDiv, so we need
    // to hook up our own handlers that trigger updates (based on state) instead
    // of depending on props passed in - hence, these globals.
    window.addEventListener('resize', this.recalculateTransform);
    document.addEventListener('mousemove', this.onMouseMove);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.width !== nextProps.width || this.props.height !== nextProps.height) {
      this.recalculateTransform();
    }
  },

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
  },

  recalculateTransform() {
    const svg = this.refs.root;
    const clientRect = svg.getBoundingClientRect();

    // If the svg has no width or no height, we can't trust it; skip
    // recalculating the transform.  This can happen when it's display:none.
    if (clientRect.width === 0 || clientRect.height === 0) {
      return;
    }

    const screenSpaceToAppSpaceTransform = svg.createSVGMatrix()
        .scale(this.props.width / clientRect.width)
        .translate(-clientRect.left, -clientRect.top);
    this.setState({ screenSpaceToAppSpaceTransform });
  },

  onMouseMove(event) {
    if (!this.state.screenSpaceToAppSpaceTransform) {
      return;
    }

    this.mousePos_.x = event.clientX;
    this.mousePos_.y = event.clientY;
    this.mousePos_ = this.mousePos_.matrixTransform(
        this.state.screenSpaceToAppSpaceTransform);
    this.setState({
      mouseX: this.mousePos_.x,
      mouseY: this.mousePos_.y
    });
    if (typeof this.props.onMouseMove === 'function') {
      this.props.onMouseMove(this.mousePos_.x, this.mousePos_.y);
    }
  },

  renderOverlays() {
    return React.Children.map(this.props.children, (child, index) => React.cloneElement(child, {
      key: index,
      width: this.props.width,
      height: this.props.height,
      mouseX: this.state.mouseX,
      mouseY: this.state.mouseY
    }));
  },

  render() {
    return (
      <svg
        ref="root"
        id="visualizationOverlay"
        version="1.1"
        baseProfile="full"
        width={this.props.width}
        height={this.props.height}
        viewBox={"0 0 " + this.props.width + " " + this.props.height}
        pointerEvents="none"
      >
        {this.props.areOverlaysVisible && this.renderOverlays()}
      </svg>
    );
  }
});
export default connect((state) => ({
  areOverlaysVisible: shouldOverlaysBeVisible(state)
}))(VisualizationOverlay);

export function shouldOverlaysBeVisible(state) {
  return !(state.runState.isRunning || state.pageConstants.isShareView);
}
