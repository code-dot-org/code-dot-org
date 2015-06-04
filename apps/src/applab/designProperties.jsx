/* global $*/

var React = require('react');
var applabMsg = require('./locale');
var elementLibrary = require('./designElements/library');

var nextKey = 0;

var DesignProperties = module.exports = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDone: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired
  },

  render: function() {
    if (!this.props.element) {
      return <p>{applabMsg.designWorkspaceDescription()}</p>;
    }

    // We want to have a unique key that doesn't change when the element id
    // changes, and has no risk of collisions between elements. We add this to
    // the backing element using jquery.data(), which keeps its own per-session
    // store of data, without affecting the serialiazation
    var key = $(this.props.element).data('key');
    if (!key) {
      key = nextKey++;
      $(this.props.element).data('key', key);
    }

    var elementType = elementLibrary.getElementType(this.props.element);
    var propertyClass = elementLibrary.getElementPropertyTable(elementType);

    var propertiesElement = React.createElement(propertyClass, {
      element: this.props.element,
      handleChange: this.props.handleChange,
      onDepthChange: this.props.onDepthChange
    });

    // We provide a key to the outer div so that element foo and element bar are
    // seen to be two completely different tables. Otherwise the defaultValues
    // in inputs don't update correctly.
    return (
      <div key={key}>
        <p>{applabMsg.designWorkspaceDescription()}</p>
        {propertiesElement}
        <button
          id="donePropertiesButton"
          onClick={this.props.onDone}>
          Done
        </button>
        <button
          id="deletePropertiesButton"
          disabled={this.props.element.id === 'screen1'}
          onClick={this.props.onDelete}>
          Delete
        </button>
      </div>
    );
  }
});
