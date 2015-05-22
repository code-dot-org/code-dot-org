var React = require('react');

var ZIndexRow = React.createClass({
  propTypes: {
    // TODO - is passing the element and modifying it good React? I think no
    element: React.PropTypes.instanceOf(HTMLElement).isRequired
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({value: newProps.initialValue});
  },

  handleMoveForward: function () {
    var element = this.props.element;
    var parent = element.parentNode;
    var index = Array.prototype.indexOf.call(parent.children, element);
    if (index + 2 >= parent.children.length) {
      // We're either the last or second to last element
      return this.handleMoveToFront();
    }

    var twoAhead = element.nextSibling.nextSibling;

    var removed = parent.removeChild(element);
    parent.insertBefore(removed, twoAhead);
    element.focus();
    this.forceUpdate();
  },

  handleMoveBackward: function () {
    var element = this.props.element;
    var parent = element.parentNode;
    var previous = element.previousSibling;
    if (!previous) {
      return;
    }

    var removed = parent.removeChild(element);
    parent.insertBefore(removed, previous);
    element.focus();
    this.forceUpdate();
  },

  handleMoveToFront: function () {
    var element = this.props.element;
    var parent = element.parentNode;
    var removed = parent.removeChild(element);
    parent.appendChild(removed);
    element.focus();
    this.forceUpdate();
  },

  handleMoveToBack: function () {
    var element = this.props.element;
    var parent = element.parentNode;
    if (parent.children.length === 1) {
      return;
    }
    var removed = parent.removeChild(element);
    parent.insertBefore(removed, parent.children[0]);
    element.focus();
    this.forceUpdate();
  },

  render: function() {
    var element = this.props.element;
    var index = Array.prototype.indexOf.call(element.parentNode.children, element);
    var isBackMost = index === 0;
    var isFrontMost = index + 1 === element.parentNode.children.length;
    return (
      <tr>
        <td>
          depth
        </td>
        <td>
          <button
            onClick={this.handleMoveToFront}
            disabled={isFrontMost}
            title='Send to Front'>
            <i className="fa fa-angle-double-right"></i>
          </button>
          <button
            onClick={this.handleMoveForward}
            disabled={isFrontMost}
            title='Send Forward'>
            <i className="fa fa-angle-right"></i>
          </button>
          <button
            onClick={this.handleMoveToBack}
            disabled={isBackMost}
            title='Send to Back'>
            <i className="fa fa-angle-double-left"></i>
          </button>
          <button
            onClick={this.handleMoveBackward}
            disabled={isBackMost}
            title='Send Backward'>
            <i className="fa fa-angle-left"></i>
          </button>
        </td>
      </tr>
    );
  }
});

module.exports = ZIndexRow;
