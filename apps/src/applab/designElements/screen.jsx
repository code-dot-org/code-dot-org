
var PropertyRow = require('./PropertyRow');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow');
var BooleanPropertyRow = require('./BooleanPropertyRow');
var EventHeaderRow = require('./EventHeaderRow');
var EventRow = require('./EventRow');
var DefaultScreenButtonPropertyRow = require('./DefaultScreenButtonPropertyRow');
var applabConstants = require('../constants');

var elementUtils = require('./elementUtils');

var ScreenProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  handleIconColorChange: function (value) {
    this.props.handleChange('icon-color', value);
    this.props.handleChange('screen-image',
      this.props.element.getAttribute('data-canonical-image-url'));
  },

  render: function () {
    var element = this.props.element;

    var iconColorPicker;
    var canonicalImage = element.getAttribute('data-canonical-image-url');
    if (applabConstants.ICON_PREFIX_REGEX.test(canonicalImage)) {
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
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')} />
        <ImagePickerPropertyRow
          desc={'image'}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          handleChange={this.props.handleChange.bind(this, 'screen-image')} />
        {iconColorPicker}
        <DefaultScreenButtonPropertyRow
          screenId={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'is-default')}/>
      </div>);
  }
});

var ScreenEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  // The screen click event handler code currently receives clicks to any
  // other design element. This could be worked around by checking for
  // event.targetId === "<id>" here, at the expense of added complexity.
  getClickEventCode: function () {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '  moveTo(event.x, event.y);\n' +
      '});\n';
    return code;
  },

  insertClick: function () {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  getKeyEventCode: function () {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "keydown", function(event) {\n' +
      '  console.log("Key: " + event.key);\n' +
      '});\n';
    return code;
  },

  insertKey: function () {
    this.props.onInsertEvent(this.getKeyEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the screen is clicked with a mouse or tapped on a screen.';
    var keyName = 'Key';
    var keyDesc = 'Triggered when a key is pressed.';

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
        <EventRow
          name={keyName}
          desc={keyDesc}
          handleInsert={this.insertKey}/>
      </div>
    );
  }
});

module.exports = {
  PropertyTab: ScreenProperties,
  EventTab: ScreenEvents,

  create: function () {
    var element = document.createElement('div');
    element.setAttribute('class', 'screen');
    element.setAttribute('tabIndex', '1');
    element.style.display = 'block';
    element.style.height = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT + 'px';
    element.style.width = applabConstants.APP_WIDTH + 'px';
    element.style.left = '0px';
    element.style.top = '0px';
    // We want our screen to be behind canvases. By setting any z-index on the
    // screen element, we create a new stacking context with this div as its
    // root, which results in all children (including canvas) to appear in front
    // of it, regardless of their z-index value.
    // see http://philipwalton.com/articles/what-no-one-told-you-about-z-index/
    element.style.position = 'absolute';
    element.style.zIndex = 0;

    return element;
  },
  onDeserialize: function (element, updateProperty) {
    var url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'screen-image', url);
    }
    // Properly position existing screens, so that canvases appear correctly.
    element.style.position = 'absolute';
    element.style.zIndex = 0;

    element.setAttribute('tabIndex', '1');
  }
};
