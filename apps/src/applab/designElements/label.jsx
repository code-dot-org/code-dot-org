/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');
var EnumPropertyRow = require('./EnumPropertyRow.jsx');

var elementUtils = require('./elementUtils');

var LabelProperties = React.createClass({
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
          desc={'text'}
          initialValue={$(element).text()}
          handleChange={this.props.handleChange.bind(this, 'text')} />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          lockState={$(element).data('lock-width') || PropertyRow.LockState.UNLOCKED}
          handleLockChange={this.props.handleChange.bind(this, 'lock-width')}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')} />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          lockState={$(element).data('lock-height') || PropertyRow.LockState.UNLOCKED}
          handleLockChange={this.props.handleChange.bind(this, 'lock-height')}
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
          options={['left', 'right', 'center', 'justify']}
          handleChange={this.props.handleChange.bind(this, 'textAlign')} />
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')} />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}/>
      </div>);

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
});

var LabelEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getClickEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '});\n';
    return code;
  },

  insertClick: function() {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the label is clicked with a mouse or tapped on a screen.';

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
  PropertyTab: LabelProperties,
  EventTab: LabelEvents,

  create: function () {
    var element = document.createElement('label');
    element.style.margin = '0px';
    element.style.padding = '2px';
    element.style.lineHeight = '1';
    element.style.fontSize = '14px';
    element.style.overflow = 'hidden';
    element.style.wordWrap = 'break-word';
    element.textContent = 'text';
    element.style.color = '#333333';
    element.style.backgroundColor = '';
    element.style.maxWidth = Applab.appWidth + 'px';

    this.resizeToFitText(element);
    return element;
  },

  resizeToFitText: function (element) {
    // Resize the label to fit the text, unless there is no text in which case make it 15 x 15 so the user has something to drag around
    if (element.textContent) {
      var clone = $(element).clone().css({
        position: 'absolute',
        visibility: 'hidden',
        width: 'auto',
        height: 'auto',
        maxWidth: (Applab.appWidth - parseInt(element.style.left, 10)) + 'px',
      }).appendTo($(document.body));

      var padding = parseInt(element.style.padding, 10);

      if ($(element).data('lock-width') !== PropertyRow.LockState.LOCKED) {
        //Truncate the width before it runs off the edge of the screen
        element.style.width = Math.min(clone.width() + 1 + 2 * padding, Applab.appWidth - clone.position().left) + 'px';
      }
      if ($(element).data('lock-height') !== PropertyRow.LockState.LOCKED) {
        element.style.height = clone.height() + 1 + 2 * padding + 'px';
      }

      clone.remove();
    } else {
      element.style.width = '15px';
      element.style.height = '15px';
    }
  },

  /**
   * @returns {boolean} True if it modified the backing element
   */
  onPropertyChange: function (element, name, value) {
    switch (name) {
      case 'text':
      case 'fontSize':
        this.resizeToFitText(element);
        break;
      case 'lock-width':
        $(element).data('lock-width', value);
        break;
      case 'lock-height':
        $(element).data('lock-height', value);
        break;
      default:
        return false;
    }
    return true;
  }
};
