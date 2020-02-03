import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import commonStyles from '../../commonStyles';
import * as dom from '../../dom';

const MOUSE_UP_EVENT_NAME = 'mouseup';
const MOUSE_UP_TOUCH_EVENT_NAME = dom.getTouchEventName(MOUSE_UP_EVENT_NAME);
const MOUSE_MOVE_EVENT_NAME = 'mousemove';
const MOUSE_MOVE_TOUCH_EVENT_NAME = dom.getTouchEventName(
  MOUSE_MOVE_EVENT_NAME
);

export const RESIZE_VISUALIZATION_EVENT = 'resize-visualization-event';

function resizeVisualization(width) {
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(RESIZE_VISUALIZATION_EVENT, true, true, width);
  window.dispatchEvent(event);
}

class VisualizationResizeBar extends React.Component {
  static propTypes = {
    hidden: PropTypes.bool,
    isRtl: PropTypes.bool
  };

  /** @type {boolean} */
  isMouseMoveBound = false;

  /** @type {function} */
  removeMouseDownTouchEvent = null;

  // Note: We're doing our own binding of event handlers here, because this
  // code is ported over from StudioApp.js and we're not sure the React event
  // handlers would preserve existing behavior exactly.  Lots of cross-browser
  // testing should be done if we switch to letting React attach these handlers.

  componentDidMount() {
    this.removeMouseDownTouchEvent = dom.addMouseDownTouchEvent(
      this.domElement,
      this.onMouseDown
    );

    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.body.addEventListener(MOUSE_UP_EVENT_NAME, this.onMouseUp);
    if (MOUSE_UP_TOUCH_EVENT_NAME) {
      document.body.addEventListener(MOUSE_UP_TOUCH_EVENT_NAME, this.onMouseUp);
    }
  }

  componentWillUnmount() {
    // Unbind any mouse move events.
    this.onMouseUp();

    // Unbind any mouse down events.
    this.removeMouseDownTouchEvent();
    this.removeMouseDownTouchEvent = null;

    // Unbind any mouse up events.
    document.body.removeEventListener(MOUSE_UP_EVENT_NAME, this.onMouseUp);
    if (MOUSE_UP_TOUCH_EVENT_NAME) {
      document.body.removeEventListener(
        MOUSE_UP_TOUCH_EVENT_NAME,
        this.onMouseUp
      );
    }
  }

  onMouseDown = event => {
    // When we see a mouse down in the resize bar, start tracking mouse moves:
    if (this.isMouseMoveBound) {
      return;
    }

    document.body.addEventListener(MOUSE_MOVE_EVENT_NAME, this.onMouseMove);
    if (MOUSE_MOVE_TOUCH_EVENT_NAME) {
      document.body.addEventListener(
        MOUSE_MOVE_TOUCH_EVENT_NAME,
        this.onMouseMove
      );
    }
    this.isMouseMoveBound = true;
    event.preventDefault();
  };

  onMouseUp = () => {
    // If we have been tracking mouse moves, remove the handler now:
    if (!this.isMouseMoveBound) {
      return;
    }

    document.body.removeEventListener(MOUSE_MOVE_EVENT_NAME, this.onMouseMove);
    if (MOUSE_MOVE_TOUCH_EVENT_NAME) {
      document.body.removeEventListener(
        MOUSE_MOVE_TOUCH_EVENT_NAME,
        this.onMouseMove
      );
    }
    this.isMouseMoveBound = false;
  };

  onMouseMove = event => {
    const rect = this.domElement.getBoundingClientRect();
    let offset;
    let newVizWidth;
    if (this.props.isRtl) {
      offset =
        window.innerWidth -
        (window.pageXOffset + rect.left + rect.width / 2) -
        parseInt(window.getComputedStyle(this.domElement).right, 10);
      newVizWidth = window.innerWidth - event.pageX - offset;
    } else {
      offset =
        window.pageXOffset +
        rect.left +
        rect.width / 2 -
        parseInt(window.getComputedStyle(this.domElement).left, 10);
      newVizWidth = event.pageX - offset;
    }
    resizeVisualization(newVizWidth);
  };

  render() {
    return (
      <div
        id="visualizationResizeBar"
        className="fa fa-ellipsis-v"
        style={{
          ...(this.props.hidden && commonStyles.hidden)
        }}
        ref={el => (this.domElement = el)}
      />
    );
  }
}
export const UnconnectedVisualizationResizeBar = VisualizationResizeBar;
export default connect(state => ({
  hidden:
    state.pageConstants.widgetMode ||
    // e.g. jigsaw
    state.pageConstants.noVisualization ||
    // e.g. share pages
    (state.pageConstants.hideSource && !state.pageConstants.isResponsive),
  isRtl: state.pageConstants.isRtl
}))(VisualizationResizeBar);
