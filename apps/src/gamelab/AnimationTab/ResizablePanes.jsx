/** @file Divide a region into a set of panels and allow resizing them.
 *
 *  Similar to react-split-pane (MIT license) but supports more than two panes
 *  and works with React 0.14.7.
 *  @see https://github.com/tomkp/react-split-pane
 */
'use strict';

var _ = require('../../lodash');

/**
 * Wraps its children to display them in a flexbox layout.
 */
var ResizablePanes = React.createClass({
  propTypes: {
    style: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      dragging: false,
      index: 0,
      overrideSizes: {}
    };
  },

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  },

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  },

  onResizerMouseDown: function (event) {
    this.unFocus();
    this.setState({
      dragging: true,
      index: parseInt(event.target.dataset.resizerIndex, 10)
    });
  },

  onMouseMove(event) {
    if (!this.state.dragging) {
      return;
    }
    this.unFocus();
    var resizingPane = this.refs['pane-' + this.state.index];
    if (!resizingPane) {
      return;
    }

    var resizingPaneDOMNode = ReactDOM.findDOMNode(resizingPane);
    if (!resizingPaneDOMNode.getBoundingClientRect) {
      return;
    }

    var boundingRect = resizingPaneDOMNode.getBoundingClientRect();
    var newWidth = event.clientX - boundingRect.left;
    var overrideSizesChange = {};
    overrideSizesChange[this.state.index] = newWidth;

    this.setState({
      overrideSizes: _.assign({}, this.state.overrideSizes, overrideSizesChange)
    });
  },

  onMouseUp() {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    }
  },

  unFocus: function () {
    if (document.selection) {
      document.selection.empty();
    } else {
      window.getSelection().removeAllRanges();
    }
  },

  getClonedChild: function (child, index) {
    var overrideSize = this.state.overrideSizes[index];
    var style = _.assign(
        {flex: '1'},
        child.props.style,
        (typeof overrideSize !== 'undefined' ? {flex: '0 0 ' + overrideSize + 'px'} : undefined)
    );

    return React.cloneElement(child, {
      ref: "pane-" + index,
      key: "pane-" + index,
      style: style
    });
  },

  getResizer: function (index) {
    return (
      <div
          key={"resizer-" + index}
          data-resizer-index={index}
          className="resizer"
          onMouseDown={this.onResizerMouseDown} />
    );
  },

  getChildren: function () {
    var childCount = React.Children.count(this.props.children);
    var computedChildren = [];
    React.Children.forEach(this.props.children, function (child, index) {
      computedChildren.push(this.getClonedChild(child, index));
      if (index !== childCount - 1) {
        computedChildren.push(this.getResizer(index));
      }
    }, this);
    return computedChildren;
  },

  render: function () {
    var styles = {
      root: _.assign({
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap'
      }, this.props.style)
    };

    return (
      <div className='resizable-panes' style={styles.root}>
        {this.getChildren()}
      </div>
    );
  }
});
module.exports = ResizablePanes;
