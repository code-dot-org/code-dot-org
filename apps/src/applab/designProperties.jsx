var React = require('react');
var applabMsg = require('./locale');
var elementLibrary = require('./designElements/library');

/**
 * We want our elements to have unique keys so that react handles them properly.
 * Using element.id both leaves opportunity for conflicts, and means the id
 * can change over the elements life time. Instead, we'll use the creation time.
 * This key will be serialized, so by using time we don't have to worry about
 * creation from earlier instances colliding. We then also need defend against
 * trying to create multiple keys within the same millisecond.
 */
var lastKey = '';
function generateReactKey() {
  var newKey = (new Date()).valueOf().toString();

  // Protect against multiple key creations in the same millisecond
  if (newKey === lastKey.split('_')[0]) {
    newKey = lastKey + '_';
  }
  lastKey = newKey;
  return newKey;
}

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
    // changes, nd has no risk of collisions between elements. The logic for
    // generating that is in generateReactKey. If we don't already have a key
    // for the element, we generate one and add it as an attribute.
    var key = this.props.element.getAttribute('date-key');
    if (!key) {
      // this should prob happen at deserialization instead
      this.props.element.setAttribute('data-key', generateReactKey());
      key = this.props.element.getAttribute('date-key');
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
    // TODO (brent) - it appears the wrong element sometimes gets deleted
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
