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
    position: PropTypes.number.isRequired,
    /**
     * @param {number} delta - amount we're trying to resize by
     * @returns {number} delta - amount we've actually resized
     */
    onResize: PropTypes.func.isRequired,
    style: PropTypes.object
  };

  state = {
    dragging: false,
    dragStart: 0
  };

  componentDidMount() {
    this.resizerRef.addEventListener('mousedown', this.onMouseDown, {
      passive: false
    });
    this.resizerRef.addEventListener('mouseup', this.onMouseUp, {
      passive: false
    });
    this.resizerRef.addEventListener('mousemove', this.onMouseMove, {
      passive: false
    });
    this.resizerRef.addEventListener('touchstart', this.onMouseDown, {
      passive: false
    });
    this.resizerRef.addEventListener('touchend', this.onMouseUp, {
      passive: false
    });
    this.resizerRef.addEventListener('touchmove', this.onMouseMove, {
      passive: false
    });
  }

  componentWillUnmount() {
    this.resizerRef.removeEventListener('mousedown', this.onMouseDown);
    this.resizerRef.removeEventListener('mouseup', this.onMouseUp);
    this.resizerRef.removeEventListener('mousemove', this.onMouseMove);
    this.resizerRef.removeEventListener('touchstart', this.onMouseDown);
    this.resizerRef.removeEventListener('touchend', this.onMouseUp);
    this.resizerRef.removeEventListener('touchmove', this.onMouseMove);
  }

  componentDidUpdate(_, state) {
    // Update listeners as dragging state changes
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove, {
        passive: false
      });
      document.addEventListener('mouseup', this.onMouseUp, {passive: false});
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
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
    const delta = pageY - this.state.dragStart;

    // onResize can choose to limit how much we actually move, and will report
    // back the value
    const actualDelta = this.props.onResize(delta);
    this.setState({dragStart: this.state.dragStart + actualDelta});
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
