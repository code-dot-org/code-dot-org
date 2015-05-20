/* global $ */
var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');

var TextProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;
    var id = element.id;
    var text = $(element).text();

    var width = parseInt(element.style.width, 10)
    var height = parseInt(element.style.height, 10)

    var link = $(element).data('link');

    var left = parseInt(element.style.left, 10) || 0;
    var top = parseInt(element.style.top, 10) || 0;

    var hidden = $(element).hasClass('design-mode-hidden');

    return (
      <table>
        <tr>
          <th>name</th>
          <th>value</th>
        </tr>
        <PropertyRow
          desc={'id'}
          initialValue={id}
          handleChange={this.props.handleChange.bind(this, 'id')} />
        <PropertyRow
          desc={'text'}
          initialValue={text}
          handleChange={this.props.handleChange.bind(this, 'text')} />
        <PropertyRow
          desc={'width (px)'}
          initialValue={width}
          handleChange={this.props.handleChange.bind(this, 'width')} />
        <PropertyRow
          desc={'height (px)'}
          initialValue={height}
          handleChange={this.props.handleChange.bind(this, 'height')} />
        <PropertyRow
          desc={'x position (px)'}
          initialValue={left}
          handleChange={this.props.handleChange.bind(this, 'left')} />
        <PropertyRow
          desc={'y position (px)'}
          initialValue={top}
          handleChange={this.props.handleChange.bind(this, 'top')} />
        <PropertyRow
          desc={'link'}
          initialValue={link}
          handleChange={this.props.handleChange.bind(this, 'link')} />
        <ColorPickerPropertyRow
          desc={'text color'}
          initialValue='#000000'
          handleChange={this.props.handleChange.bind(this, 'textColor')} />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue='#ffffff'
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')} />
        <PropertyRow
          desc={'font size (px)'}
          initialValue='14'
          handleChange={this.props.handleChange.bind(this, 'fontSize')} />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={hidden}
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
  PropertyTable: TextProperties,

  create: function() {
    var element = document.createElement('div');
    element.style.margin = '10px 5px';
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.overflow = 'hidden';
    element.style.wordWrap = 'break-word';
    element.textContent = 'text';

    return element;
  }
};
