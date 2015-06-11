/* global $ */
var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');

var CheckboxProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <div>
        <PropertyRow
          desc={'id'}
          initialValue={element.id}
          handleChange={this.props.handleChange.bind(this, 'id')} />
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
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />
        <BooleanPropertyRow
          desc={'checked'}
          initialValue={element.checked}
          handleChange={this.props.handleChange.bind(this, 'checked')} />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}/>
      </div>);

    // TODO:
    // enabled (p2)
  }
});

module.exports = {
  PropertyTable: CheckboxProperties,

  create: function() {
    var element = document.createElement('input');
    element.type = 'checkbox';
    element.style.width = '12px';
    element.style.height = '12px';
    element.style.margin = '0px';

    this.onDeserialize(element);

    return element;
  },

  onDeserialize: function (element) {
    // Disable click events unless running
    $(element).on('click', function(e) {
      if (!Applab.isRunning()) {
        element.checked = !element.checked;
      }
    });
  }
};
