var React = require('react');
var color = require('../../color');
var rowStyle = require('./rowStyle');
var FontAwesome = require('../../templates/FontAwesome');

var ZOrderRow = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
  },

  render: function () {
    var element = this.props.element;

    // Element will be wrapped in a resizable div
    var outerElement = element.parentNode;
    var index = Array.prototype.indexOf.call(outerElement.parentNode.children, outerElement);
    var isBackMost = index === 0;
    var isFrontMost = index + 1 === outerElement.parentNode.children.length;

    var squareButton = {
      width: 42,
      height: 42,
      marginLeft: 0,
      marginRight: 10,
      backgroundColor: color.cyan
    };

    var squareButtonDisabled = {
      width: 42,
      height: 42,
      marginLeft: 0,
      marginRight: 10
    };

    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>
          depth
        </div>
        <div>
          <button
            style={isBackMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'toBack')}
            disabled={isBackMost}
            title='Send to Back'>
            <FontAwesome icon="angle-double-left" />
          </button>
          <button
            style={isBackMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'backward')}
            disabled={isBackMost}
            title='Send Backward'>
            <FontAwesome icon="angle-left" />
          </button>
          <button
            style={isFrontMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'forward')}
            disabled={isFrontMost}
            title='Send Forward'>
            <FontAwesome icon="angle-right" />
          </button>
          <button
            style={isFrontMost ? squareButtonDisabled : squareButton}
            onClick={this.props.onDepthChange.bind(this, element, 'toFront')}
            disabled={isFrontMost}
            title='Send to Front'>
            <FontAwesome icon="angle-double-right" />
          </button>
        </div>
      </div>
    );
  }
});

module.exports = ZOrderRow;
