var React = require('react');

// TODO (brent) - might make more sense to require library and get these from
// the library
var ButtonProperties = require('./designElements/button.jsx').PropertyTable;
var TextProperties = require('./designElements/text.jsx').PropertyTable;
var InputProperties = require('./designElements/textInput.jsx').PropertyTable;

var DesignProperties = module.exports = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDone: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired
  },

  render: function() {
    if (!this.props.element) {
      return <p>Click on an element to edit its properties.</p>;
    }

    var tagname = this.props.element.tagName.toLowerCase();
    var propertyClass;
    // TODO (brent) - eventually this will have to be something other than tagname
    switch (tagname) {
      case 'button':
        propertyClass = ButtonProperties;
        break;

      case 'div':
        propertyClass = TextProperties;
        break;

      case 'input':
        propertyClass = InputProperties;
        break;
    }

    var propertiesElement = React.createElement(propertyClass, {
      element: this.props.element,
      handleChange: this.props.handleChange
    });

    // We provide a key to the outer div so that element foo and element bar are
    // seen to be two completely different tables. Otherwise the defaultValues
    // in inputs don't update correctly.
    // TODO (brent) - right now if i create two elements with the same id, I
    // can still run into the same problem, where I click on the other element
    // and the table doesn't update
    // TODO (brent) - it appears the wrong element sometimes gets deleted
    return (
      <div key={this.props.element.id}>
        {propertiesElement}
        <button
          id="donePropertiesButton"
          onClick={this.props.onDone}>
          Done
        </button>
        <button
          id="deletePropertiesButton"
          onClick={this.props.onDelete}>
          Delete
        </button>
      </div>
    );
  }
});
