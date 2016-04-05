/* global $ */


var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var SliderProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <div id='propertyRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true} />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')} />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')} />
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
          desc={'value'}
          isNumber={true}
          initialValue={element.defaultValue}
          handleChange={this.props.handleChange.bind(this, 'defaultValue')} />
        <PropertyRow
          desc={'minimum value'}
          isNumber={true}
          initialValue={parseInt(element.min, 10)}
          handleChange={this.props.handleChange.bind(this, 'min')} />
        <PropertyRow
          desc={'maximum value'}
          isNumber={true}
          initialValue={parseInt(element.max, 10)}
          handleChange={this.props.handleChange.bind(this, 'max')} />
        <PropertyRow
          desc={'step size'}
          isNumber={true}
          initialValue={parseInt(element.step, 10)}
          handleChange={this.props.handleChange.bind(this, 'step')} />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}/>
      </div>);
  }
});

var SliderEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getInputEventCode: function () {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "input", function(event) {\n' +
      '  console.log("' + id + ' value: " + getNumber("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertInput: function () {
    this.props.onInsertEvent(this.getInputEventCode());
  },

  render: function () {
    var element = this.props.element;

    var inputName = 'Input';
    var inputDesc = 'Triggered whenever the value of the slider is modified.';

    return (
      <div id='eventRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}/>
        <EventHeaderRow/>
        <EventRow
          name={inputName}
          desc={inputDesc}
          handleInsert={this.insertInput}/>
      </div>
    );
  }
});

module.exports = {
  PropertyTab: SliderProperties,
  EventTab: SliderEvents,

  create: function () {
    var element = document.createElement('input');
    element.type = 'range';
    element.style.margin = '0px';
    element.style.padding = '0px';
    element.style.width = '150px';
    element.style.height = '24px';
    element.defaultValue = 50;
    element.min = 0;
    element.max = 100;
    element.step = 1;

    return element;
  },

  onPropertyChange: function (element, name, value) {
    switch (name) {
      case 'defaultValue':
        element.defaultValue = value;
        break;
      case 'min':
        element.min = value;
        break;
      case 'max':
        element.max = value;
        break;
      case 'step':
        element.step = value;
        break;
      default:
        return false;
    }
    return true;
  }
};
