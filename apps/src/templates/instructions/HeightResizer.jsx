/**
 * HeightResizer
 * A draggable, horizontal toolbar. As it is dragged, it calls back to onResize
 * which handles any movement.
 */

import React, {PropTypes} from 'react';
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
    style: PropTypes.object,
  };

  state = {
    dragging: false,
    dragStart: 0
  };

  componentDidUpdate(_, state) {
    // Update listeners as dragging state changes
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  onMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();

    this.setState({ dragging: true, dragStart: event.pageY });
  };

  onMouseUp = (event) => {
    event.stopPropagation();
    event.preventDefault();

    this.setState({ dragging: false });
  };

  onMouseMove = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (!this.state.dragging) {
      return;
    }

    const delta = event.pageY - this.state.dragStart;

    // onResize can choose to limit how much we actually move, and will report
    // back the value
    const actualDelta = this.props.onResize(delta);
    this.setState({ dragStart: this.state.dragStart + actualDelta });
  };

  render() {
    const mainStyle = [
      styles.main,
      {
        top: this.props.position - RESIZER_HEIGHT
      },
      this.props.style,
    ];

    return (
      <div
        id="ui-test-resizer"
        style={mainStyle}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        <div style={styles.ellipsis} className="fa fa-ellipsis-h"/>
      </div>
    );
  }
}

export default Radium(HeightResizer);
