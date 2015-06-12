/* global $*/

var React = require('react');
var applabMsg = require('./locale');
var elementLibrary = require('./designElements/library');

var DeleteElementButton = require('./designElements/DeleteElementButton.jsx');

var nextKey = 0;

var DesignProperties = module.exports = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
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

    var deleteButton;
    var element = this.props.element;
    // First screen is not deletable
    var firstScreen = elementType === elementLibrary.ElementType.SCREEN &&
        element.parentNode.firstChild === element;
    if (!firstScreen) {
      deleteButton = (<DeleteElementButton
        shouldConfirm={elementType === elementLibrary.ElementType.SCREEN}
        handleDelete={this.props.onDelete}/>);
    }


    // We provide a key to the outer div so that element foo and element bar are
    // seen to be two completely different tables. Otherwise the defaultValues
    // in inputs don't update correctly.
    return (
      <div key={key}>
        <p>{applabMsg.designWorkspaceDescription()}</p>
        {propertiesElement}
        {deleteButton}
      </div>
    );
  }
});
