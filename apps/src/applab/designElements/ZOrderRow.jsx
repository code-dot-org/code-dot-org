var React = require('react');

var ZOrderRow = React.createClass({
  propTypes: {
    // TODO - is passing the element and modifying it good React? I think no
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({value: newProps.initialValue});
  },

  render: function() {
    var element = this.props.element;
    var index = Array.prototype.indexOf.call(element.parentNode.children, element);
    var isBackMost = index === 0;
    var isFrontMost = index + 1 === element.parentNode.children.length;

    var squareButton = {
      width: 42,
      height: 42
    };

    return (
      <tr>
        <td>
          depth
        </td>
        <td>
          <button
            style={squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'toBack')}
            disabled={isBackMost}
            title='Send to Back'>
            <i className="fa fa-angle-double-left"></i>
          </button>
          <button
            style={squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'backward')}
            disabled={isBackMost}
            title='Send Backward'>
            <i className="fa fa-angle-left"></i>
          </button>
          <button
            style={squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'forward')}
            disabled={isFrontMost}
            title='Send Forward'>
            <i className="fa fa-angle-right"></i>
          </button>
          <button
            style={squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'toFront')}
            disabled={isFrontMost}
            title='Send to Front'>
            <i className="fa fa-angle-double-right"></i>
          </button>  
        </td>
      </tr>
    );
  }
});

module.exports = ZOrderRow;
