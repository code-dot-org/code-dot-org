/**
 * HeightResizer
 * A draggable, horizontal toolbar. As it is dragged, it calls back to onResize
 * which handles any movement.
 */

var _ = require('../../lodash');
var color = require('../../color');

var RESIZER_HEIGHT = 13; // TODO $resize-bar-width from style-constants

var styles = {
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
    lineHeight: RESIZER_HEIGHT + 'px'
  }
};

var HeightResizer = React.createClass({
  propTypes: {
    position: React.PropTypes.number.isRequired,
    /**
     * @param {number} delta - amount we're trying to resize by
     * @returns {number} delta - amount we've actually resized
     */
    onResize: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      dragging: false,
      dragStart: 0
    };
  },

  componentDidUpdate: function (props, state) {
    // Update listeners as dragging state changes
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  },

  onMouseDown: function (event) {
    event.stopPropagation();
    event.preventDefault();

    this.setState({dragging: true, dragStart: event.pageY});
  },

  onMouseUp: function (event) {
    event.stopPropagation();
    event.preventDefault();

    this.setState({dragging: false});
  },

  onMouseMove: function (event) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.state.dragging) {
      return;
    }

    var delta = event.pageY - this.state.dragStart;

    // onResize can choose to limit how much we actually move, and will report
    // back the value
    var actualDelta = this.props.onResize(delta);
    this.setState({dragStart: this.state.dragStart + actualDelta});
  },

  render: function () {
    var mainStyle = _.assign({}, styles.main, {
      top: this.props.position
    });

    return (
      <div style={mainStyle}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}>
        <div style={styles.ellipsis} className="fa fa-ellipsis-h"/>
      </div>
    );
  }
});

module.exports = HeightResizer;
