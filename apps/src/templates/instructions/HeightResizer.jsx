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

const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

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
    style: PropTypes.object,
    vertical: PropTypes.bool
  };

  state = {
    dragging: false,
    dragStart: 0
  };

  componentDidMount() {
    this.resizerRef.addEventListener('mousedown', this.onMouseDown);
    this.resizerRef.addEventListener('mouseup', this.onMouseUp);
    this.resizerRef.addEventListener('mousemove', this.onMouseMove);
    this.resizerRef.addEventListener('touchstart', this.onMouseDown);
    this.resizerRef.addEventListener('touchend', this.onMouseUp);
    this.resizerRef.addEventListener('touchmove', this.onMouseMove);
  }

  componentWillUnmount() {
    this.resizerRef.removeEventListener('mousedown', this.onMouseDown);
    this.resizerRef.removeEventListener('mouseup', this.onMouseUp);
    this.resizerRef.removeEventListener('mousemove', this.onMouseMove);
    this.resizerRef.removeEventListener('touchstart', this.onMouseDown);
    this.resizerRef.removeEventListener('touchend', this.onMouseUp);
    this.resizerRef.removeEventListener('touchmove', this.onMouseMove);
  }

  componentDidUpdate(_, prevState) {
    // Update listeners as dragging state changes.
    if (!prevState.dragging && this.state.dragging) {
      // Add document listeners when drag starts.
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (prevState.dragging && !this.state.dragging) {
      // Remove document listeners when drag ends.
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  onMouseDown = event => {
    if (event.button && event.button !== 0) {
      return;
    }

    event.stopPropagation();
    if (event.cancelable) {
      event.preventDefault();
    }

    const pageX = event.pageX || (event.touches && event.touches[0].pageX);
    const pageY = event.pageY || (event.touches && event.touches[0].pageY);
    this.setState({
      dragging: true,
      dragStart: this.props.vertical ? pageX : pageY
    });
  };

  onMouseUp = event => {
    event.stopPropagation();
    if (event.cancelable) {
      event.preventDefault();
    }

    this.setState({dragging: false});
  };

  onMouseMove = event => {
    event.stopPropagation();
    if (event.cancelable) {
      event.preventDefault();
    }

    if (!this.state.dragging) {
      return;
    }

    const pageX = event.pageX || (event.touches && event.touches[0].pageX);
    const pageY = event.pageY || (event.touches && event.touches[0].pageY);
    const desiredHeight =
      (this.props.vertical ? pageX : pageY) - this.props.resizeItemTop();

    this.props.onResize(desiredHeight);
  };

  render() {
    let mainStyle, ellipsisStyle, ellipsisClassName;
    if (this.props.vertical) {
      mainStyle = [
        styles.mainWidth,
        {
          left: this.props.position - RESIZER_HEIGHT
        },
        this.props.style
      ];
      ellipsisStyle = styles.ellipsisVertical;
      ellipsisClassName = 'fa fa-ellipsis-v';
    } else {
      mainStyle = [
        styles.main,
        {
          top: this.props.position - RESIZER_HEIGHT
        },
        this.props.style
      ];
      ellipsisStyle = styles.ellipsis;
      ellipsisClassName = 'fa fa-ellipsis-h';
    }

    return (
      <div
        id="ui-test-resizer"
        style={mainStyle}
        ref={ref => (this.resizerRef = ref)}
      >
        <div style={ellipsisStyle} className={ellipsisClassName} />
      </div>
    );
  }
}

const styles = {
  main: {
    position: 'absolute',
    height: RESIZER_HEIGHT,
    left: 0,
    right: 0
  },
  mainWidth: {
    position: 'absolute',
    width: RESIZER_HEIGHT,
    top: 0,
    bottom: 0
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
  },
  ellipsisVertical: {
    width: '100%',
    color: color.lighter_gray,
    fontSize: 24,
    textAlign: 'center',
    cursor: 'ew-resize',
    whiteSpace: 'nowrap',
    lineHeight: RESIZER_HEIGHT + 'px',
    top: '50%',
    position: 'absolute',
    transform: 'translateY(-50%)'
  }
};

export default Radium(HeightResizer);
