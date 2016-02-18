/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

// Prefix used to generate default group ids
var GROUP_ID_PREFIX = 'radio_group';

var RadioButtonProperties = React.createClass({
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
          isIdRow={true}/>
        <PropertyRow
          desc={'group id'}
          initialValue={element.getAttribute('name') || ''}
          handleChange={this.props.handleChange.bind(this, 'groupId')} />
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

var RadioButtonEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getChangeEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("' + id + ' checked? " + getChecked("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertChange: function() {
    this.props.onInsertEvent(this.getChangeEventCode());
  },

  render: function () {
    var element = this.props.element;
    var changeName = 'Change';
    var changeDesc = 'Triggered when the radio button state changes ' +
        'both from selected to de-selected, and from de-selected to selected.';

    return (
      <div id='eventRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}/>
        <EventHeaderRow/>
        <EventRow
          name={changeName}
          desc={changeDesc}
          handleInsert={this.insertChange}/>
      </div>
    );
  }
});

/**
 * Gets the initial group id for a new radio button.
 * To figure out the initial group id, we:
 * 1) Try to find the most recently created radio button on the current screen.
 * 2) If it exists, use that group id. If not, generate an unused group id.
 * @returns {string} The default group id for the new radio button
 */
function getInitialGroupId() {
  // Get the most recently added button on the current screen
  var lastRadioButton = getLastRadioButtonOnCurrentScreen();

  if (lastRadioButton && lastRadioButton.getAttribute('name') &&
      lastRadioButton.getAttribute('name').trim() !== '') {

    // We have an existing radio button, use that group id
    return lastRadioButton.getAttribute('name');
  }

  // Otherwise, generate an unused one
  return getUnusedGroupId();
}

/**
 * Gets the most recently added radio button on current screen.
 * @returns {HTMLElement} The radio button element. Returns null if none exists.
 */
function getLastRadioButtonOnCurrentScreen() {
  // Get the current visible screen element
  var currentScreen = $('#designModeViz .screen:visible').first();

  // Find the last radio button element on the current screen, if any
  var radioButton = currentScreen.find('input[type=radio]').last();

  return radioButton.length > 0 ? radioButton[0] : null;
}

/**
 * Generates a group id that is not used by any other existing radio buttons.
 * @returns {string} An group id that isn't used by other radio buttons
 */
function getUnusedGroupId() {
  var i = 1;
  while ($('input[name=' + GROUP_ID_PREFIX + i + ']').length > 0) {
    i++;
  }

  return GROUP_ID_PREFIX + i;
}

module.exports = {
  PropertyTab: RadioButtonProperties,
  EventTab: RadioButtonEvents,

  create: function (withoutId) {
    var element = document.createElement('input');
    element.type = 'radio';
    element.style.width = '12px';
    element.style.height = '12px';
    element.style.margin = '0px';

    // Only generate group id if this is an element with an id.
    if (!withoutId) {
      element.name = getInitialGroupId();
    }
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
