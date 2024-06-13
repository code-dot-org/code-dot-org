import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import BooleanPropertyRow from './BooleanPropertyRow';
import * as elementUtils from './elementUtils';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import PropertyRow from './PropertyRow';
import ZOrderRow from './ZOrderRow';

// Prefix used to generate default group ids
const GROUP_ID_PREFIX = 'radio_group';

class RadioButtonProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
  };

  render() {
    const element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_groupId()}
          initialValue={element.getAttribute('name') || ''}
          handleChange={this.props.handleChange.bind(this, 'groupId')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_widthPx()}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_heightPx()}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_xPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_yPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <BooleanPropertyRow
          desc={applabMsg.designElementProperty_hidden()}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')}
        />
        <BooleanPropertyRow
          desc={applabMsg.designElementProperty_checked()}
          initialValue={element.checked}
          handleChange={this.props.handleChange.bind(this, 'checked')}
        />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}
        />
      </div>
    );

    // TODO:
    // enabled (p2)
  }
}

class RadioButtonEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
  };

  getChangeEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function( ) {\n\tconsole.log("${id} checked? " + getChecked("${id}"));\n}`;
    return `onEvent("${id}", "change", ${callback});`;
  }

  insertChange = () => {
    this.props.onInsertEvent(this.getChangeEventCode());
  };

  render() {
    const element = this.props.element;

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <EventHeaderRow />
        <EventRow
          name={applabMsg.designElementEvent_change()}
          desc={applabMsg.designElement_radioButton_changeEventDesc()}
          handleInsert={this.insertChange}
        />
      </div>
    );
  }
}

/**
 * Gets the initial group id for a new radio button.
 * To figure out the initial group id, we:
 * 1) Try to find the most recently created radio button on the current screen.
 * 2) If it exists, use that group id. If not, generate an unused group id.
 * @returns {string} The default group id for the new radio button
 */
function getInitialGroupId() {
  // Get the most recently added button on the current screen
  const lastRadioButton = getLastRadioButtonOnCurrentScreen();

  if (
    lastRadioButton &&
    lastRadioButton.getAttribute('name') &&
    lastRadioButton.getAttribute('name').trim() !== ''
  ) {
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
  const currentScreen = $('#designModeViz .screen:visible').first();

  // Find the last radio button element on the current screen, if any
  const radioButton = currentScreen.find('input[type=radio]').last();

  return radioButton.length > 0 ? radioButton[0] : null;
}

/**
 * Generates a group id that is not used by any other existing radio buttons.
 * @returns {string} An group id that isn't used by other radio buttons
 */
function getUnusedGroupId() {
  let i = 1;
  while ($('input[name=' + GROUP_ID_PREFIX + i + ']').length > 0) {
    i++;
  }

  return GROUP_ID_PREFIX + i;
}

export default {
  PropertyTab: RadioButtonProperties,
  EventTab: RadioButtonEvents,

  create: function (withoutId) {
    const element = document.createElement('input');
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
    $(element).on('click', function (e) {
      if (!Applab.isRunning()) {
        element.checked = !element.checked;
      }
    });
  },
};
