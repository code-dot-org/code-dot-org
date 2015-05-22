/* global $ */
var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var OptionsSelectRow = require('./OptionsSelectRow.jsx');

var elementUtils = require('./elementUtils');

var DropdownProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <table>
        <tr>
          <th>name</th>
          <th>value</th>
        </tr>
        <PropertyRow
          desc={'id'}
          initialValue={element.id}
          handleChange={this.props.handleChange.bind(this, 'id')} />
        <OptionsSelectRow
          desc={'options'}
          element={element}
          handleChange={this.props.handleChange.bind(this, 'options')} />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'width')} />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'height')} />
        <PropertyRow
          desc={'x position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')} />
        <PropertyRow
          desc={'y position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')} />
        <PropertyRow
          desc={'font size (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.fontSize, 10)}
          handleChange={this.props.handleChange.bind(this, 'fontSize')} />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />

      </table>);

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
    // send back/forward
  }
});

module.exports = {
  PropertyTable: DropdownProperties,

  create: function() {
    var element = document.createElement('select');
    element.style.width = '100px';
    element.style.height = '30px';
    element.style.fontSize = '14px';

    return element;
  }
};
