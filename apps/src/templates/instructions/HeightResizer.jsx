/**
 * HeightResizer
 * A draggable, horizontal toolbar. As it is dragged, it calls back to onResize
 * which handles any movement.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import {getTouchEventName} from '../../dom';

const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const MOUSE_DOWN_EVENT_NAME = 'mousedown';
const MOUSE_DOWN_TOUCH_EVENT_NAME = getTouchEventName(MOUSE_DOWN_EVENT_NAME);
const MOUSE_UP_EVENT_NAME = 'mouseup';
const MOUSE_UP_TOUCH_EVENT_NAME = getTouchEventName(MOUSE_UP_EVENT_NAME);
const MOUSE_MOVE_EVENT_NAME = 'mousemove';
const MOUSE_MOVE_TOUCH_EVENT_NAME = getTouchEventName(MOUSE_MOVE_EVENT_NAME);

const styles = {
  main: {
    position: 'absolute',
    height: RESIZER_HEIGHT,
    left: 0,
    right: 0
  },
  ellipsis: {
    width: '100%',
    color: color.lighter_gray,
    fontSize: 24,
    textAlign: 'center',
    cursor: 'ns-resize',
    whiteSpace: 'nowrap',
    lineHeight: RESIZER_HEIGHT + 'px',
    paddingTop: 1 // results in a slightly better centering
  }
};

class HeightResizer extends React.Component {
  static propTypes = {
    /**
     * @returns {number} top - the top Y value of the element we are resizing
     */
    resizeItemTop: PropTypes.func.isRequired,
    position: PropTypes.number.isRequired,
    /**
     * @param {number} desiredHeight - the height we'd like to resize to
     */
    onResize: PropTypes.func.isRequired,
    style: PropTypes.object
  };

  state = {
    dragging: false,
    dragStart: 0
  };

  componentDidMount() {
    this.resizerRef.addEventListener(MOUSE_DOWN_EVENT_NAME, this.onMouseDown);
    this.resizerRef.addEventListener(MOUSE_UP_EVENT_NAME, this.onMouseUp);
    this.resizerRef.addEventListener(MOUSE_MOVE_EVENT_NAME, this.onMouseMove);
    this.resizerRef.addEventListener(
      MOUSE_DOWN_TOUCH_EVENT_NAME,
      this.onMouseDown
    );
    this.resizerRef.addEventListener(MOUSE_UP_TOUCH_EVENT_NAME, this.onMouseUp);
    this.resizerRef.addEventListener(
      MOUSE_MOVE_TOUCH_EVENT_NAME,
      this.onMouseMove
    );
  }

  componentWillUnmount() {
    this.resizerRef.removeEventListener(
      MOUSE_DOWN_EVENT_NAME,
      this.onMouseDown
    );
    this.resizerRef.removeEventListener(MOUSE_UP_EVENT_NAME, this.onMouseUp);
    this.resizerRef.removeEventListener(
      MOUSE_MOVE_EVENT_NAME,
      this.onMouseMove
    );
    this.resizerRef.removeEventListener(
      MOUSE_DOWN_TOUCH_EVENT_NAME,
      this.onMouseDown
    );
    this.resizerRef.removeEventListener(
      MOUSE_UP_TOUCH_EVENT_NAME,
      this.onMouseUp
    );
    this.resizerRef.removeEventListener(
      MOUSE_MOVE_TOUCH_EVENT_NAME,
      this.onMouseMove
    );
  }

  componentDidUpdate(_, prevState) {
    // Update listeners as dragging state changes.
    // These appear to be necessary for mouse, but not for touch.
    if (!prevState.dragging && this.state.dragging) {
      // Add document listeners when drag starts.
      document.addEventListener(MOUSE_MOVE_EVENT_NAME, this.onMouseMove);
      document.addEventListener(MOUSE_UP_EVENT_NAME, this.onMouseUp);
    } else if (prevState.dragging && !this.state.dragging) {
      // Remove document listeners when drag ends.
      document.removeEventListener(MOUSE_MOVE_EVENT_NAME, this.onMouseMove);
      document.removeEventListener(MOUSE_UP_EVENT_NAME, this.onMouseUp);
    }
  }

  onMouseDown = event => {
    if (event.button && event.button !== 0) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    const pageY = event.pageY || (event.touches && event.touches[0].pageY);
    this.setState({dragging: true, dragStart: pageY});
  };

  onMouseUp = event => {
    event.stopPropagation();
    event.preventDefault();

    this.setState({dragging: false});
  };

  onMouseMove = event => {
    event.stopPropagation();
    event.preventDefault();

    if (!this.state.dragging) {
      return;
    }

    const pageY = event.pageY || (event.touches && event.touches[0].pageY);
    const desiredHeight = pageY - this.props.resizeItemTop();

    this.props.onResize(desiredHeight);
  };

  render() {
    const mainStyle = [
      styles.main,
      {
        top: this.props.position - RESIZER_HEIGHT
      },
      this.props.style
    ];

    return (
      <div
        id="ui-test-resizer"
        style={mainStyle}
        ref={ref => (this.resizerRef = ref)}
      >
        <div style={styles.ellipsis} className="fa fa-ellipsis-h" />
      </div>
    );
  }
}

export default Radium(HeightResizer);
