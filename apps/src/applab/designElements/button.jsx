/* global $ */


var PropertyRow = require('./PropertyRow');
var BooleanPropertyRow = require('./BooleanPropertyRow');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow');
var ZOrderRow = require('./ZOrderRow');
var EventHeaderRow = require('./EventHeaderRow');
var EventRow = require('./EventRow');
var EnumPropertyRow = require('./EnumPropertyRow');
var color = require('../../color');
var ICON_PREFIX_REGEX = require('../constants').ICON_PREFIX_REGEX;

var elementUtils = require('./elementUtils');

var ButtonProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  handleIconColorChange: function (value) {
    this.props.handleChange('icon-color', value);
    this.props.handleChange('image',
      this.props.element.getAttribute('data-canonical-image-url'));
  },

  render: function () {
    var element = this.props.element;

    var iconColorPicker;
    var canonicalImage = element.getAttribute('data-canonical-image-url');
    if (ICON_PREFIX_REGEX.test(canonicalImage)) {
      iconColorPicker = (
        <ColorPickerPropertyRow
          desc={'icon color'}
          initialValue={elementUtils.rgb2hex(element.getAttribute('data-icon-color') || '#000000')}
          handleChange={this.handleIconColorChange} />
      );
    }

    return (
      <div id='propertyRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true} />
        <PropertyRow
          desc={'text'}
          initialValue={$(element).text()}
          handleChange={this.props.handleChange.bind(this, 'text')} />
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
        <ColorPickerPropertyRow
          desc={'text color'}
          initialValue={elementUtils.rgb2hex(element.style.color)}
          handleChange={this.props.handleChange.bind(this, 'textColor')} />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')} />
        <PropertyRow
          desc={'font size (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.fontSize, 10)}
          handleChange={this.props.handleChange.bind(this, 'fontSize')} />
        <EnumPropertyRow
          desc={'text alignment'}
          initialValue={element.style.textAlign || 'center'}
          options={['left','right','center','justify']}
          handleChange={this.props.handleChange.bind(this, 'textAlign')} />
        <ImagePickerPropertyRow
          desc={'image'}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          handleChange={this.props.handleChange.bind(this, 'image')} />
        {iconColorPicker}
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}/>
      </div>);

    // TODO (brent):
    // bold/italics/underline (p2)
    // shape (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
});

var ButtonEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getClickEventCode: function () {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '});\n';
    return code;
  },

  insertClick: function () {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the button is clicked with a mouse or tapped on a screen.';

    return (
      <div id='eventRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}/>
        <EventHeaderRow/>
        <EventRow
          name={clickName}
          desc={clickDesc}
          handleInsert={this.insertClick}/>
      </div>
    );
  }
});

module.exports = {
  PropertyTab: ButtonProperties,
  EventTab: ButtonEvents,
  create: function () {
    var element = document.createElement('button');
    element.appendChild(document.createTextNode('Button'));
    element.style.padding = '0px';
    element.style.margin = '0px';
    element.style.height = '30px';
    element.style.width = '80px';
    element.style.fontSize = '14px';
    element.style.color = color.white;
    element.style.backgroundColor = color.applab_button_teal;

    return element;
  },
  onDeserialize: function (element, updateProperty) {
    var url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'image', url);
    }
  }
};
