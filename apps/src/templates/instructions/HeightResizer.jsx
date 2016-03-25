var _ = require('lodash');
var color = require('../../color');

var HeightResizer = React.createClass({

  propTypes: {
    style: React.PropTypes.object,
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

    // TODO
    this.setState({ dragging: true, dragStart: event.pageY });
  },

  onMouseUp: function (event) {
    event.stopPropagation();
    event.preventDefault();

    this.setState({ dragging: false });
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
    this.setState({ dragStart: this.state.dragStart + actualDelta });
  },

  render: function () {
    var style = {
      width: '100%',
      color: color.lighter_gray,
      fontSize: 24,
      textAlign: 'center',
      cursor: 'ns-resize',
      whiteSpace: 'nowrap',
      lineHeight: this.props.style.height + 'px'
    };

    return (
      <div style={this.props.style}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}>
        <div style={style} className="fa fa-ellipsis-h"/>
      </div>
    );
  }
});

module.exports = HeightResizer;
