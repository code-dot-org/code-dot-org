var React = require('react');

var ButtonProperties = require('./elements/button').PropertyTable;
var TextProperties = require('./elements/text').PropertyTable;
var InputProperties = require('./elements/textInput').PropertyTable;


React.PropTypes.emptyString = function(props, propName, componentName) {
  if (props[propName] !== '') {
    return new Error('Not an Empty String');
  }
};

React.PropTypes.numberOrEmptyString = React.PropTypes.oneOfType([
  React.PropTypes.number,
  React.PropTypes.emptyString
]);

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    handleChange: React.PropTypes.func
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
  },
  render: function() {
    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            defaultValue={this.props.initialValue}
            onChange={this.handleChangeInternal}/>
        </td>
      </tr>
    );
  }
});

var DesignProperties = module.exports = React.createClass({
  // TODO (brent): might be that we don't actually want these if we're going
  // to be more flexible about what props we get
  // might also be the case that we actually want the list to be more dynamic
  // than it is currently
  propTypes: {
    // element:
    // TODO required unless element is null
    handleChange: React.PropTypes.func,
    onDone: React.PropTypes.func,
    onDelete: React.PropTypes.func
  },

  render: function() {
    if (!this.props.element) {
      return <p>Click on an element to edit its properties.</p>;
    }

    var propertiesElement;
    var tagname = this.props.element.tagName.toLowerCase();
    // TODO - eventually this will have to be something other than tagname
    switch (tagname) {
      case 'button':
        properties = <ButtonProperties
          element={this.props.element}
          handleChange={this.props.handleChange}/>;
        break;

      // TODO - this will become a div
      case 'label':
        properties = <TextProperties
          element={this.props.element}
          handleChange={this.props.handleChange}/>;
        break;

      case 'input':
        properties = <InputProperties
          element={this.props.element}
          handleChange={this.props.handleChange}/>
    }

    // We provide a key to the outer div so that element foo and element bar are
    // seen to be two completely different tables. Otherwise they don't the
    // defaultValues in inputs don't update correctly.
    // TODO - can we do better than depend on HTML elements having unique ids?
    return (
      <div key={this.props.id}>
        {properties}
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
