import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import {themeOptions, CLASSIC_THEME_INDEX} from '../constants';
import designMode from '../designMode';
import themeValues, {CLASSIC_TEXT_INPUT_PADDING} from '../themeValues';

import BooleanPropertyRow from './BooleanPropertyRow';
import BorderProperties from './BorderProperties';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import * as elementUtils from './elementUtils';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import FontFamilyPropertyRow from './FontFamilyPropertyRow';
import elementLibrary from './library';
import PropertyRow from './PropertyRow';
import TextAlignmentPropertyRow, {
  TEXT_ALIGNMENT_LEFT,
} from './TextAlignmentPropertyRow';
import ZOrderRow from './ZOrderRow';

class TextInputProperties extends React.Component {
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
          isIdRow
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_placeholder()}
          initialValue={element.getAttribute('placeholder') || ''}
          handleChange={this.props.handleChange.bind(this, 'placeholder')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_widthPx()}
          isNumber
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_heightPx()}
          isNumber
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_xPositionPx()}
          isNumber
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_yPositionPx()}
          isNumber
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <ColorPickerPropertyRow
          desc={applabMsg.designElementProperty_textColor()}
          initialValue={element.style.color}
          handleChange={this.props.handleChange.bind(this, 'textColor')}
        />
        <ColorPickerPropertyRow
          desc={applabMsg.designElementProperty_backgroundColor()}
          initialValue={element.style.backgroundColor}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
        />
        <FontFamilyPropertyRow
          initialValue={designMode.fontFamilyOptionFromStyle(
            element.style.fontFamily
          )}
          handleChange={this.props.handleChange.bind(this, 'fontFamily')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_fontSizePx()}
          isNumber
          initialValue={parseInt(element.style.fontSize, 10)}
          handleChange={this.props.handleChange.bind(this, 'fontSize')}
        />
        <TextAlignmentPropertyRow
          initialValue={element.style.textAlign || TEXT_ALIGNMENT_LEFT}
          handleChange={this.props.handleChange.bind(this, 'textAlign')}
        />
        <BorderProperties
          element={element}
          handleBorderWidthChange={this.props.handleChange.bind(
            this,
            'borderWidth'
          )}
          handleBorderColorChange={this.props.handleChange.bind(
            this,
            'borderColor'
          )}
          handleBorderRadiusChange={this.props.handleChange.bind(
            this,
            'borderRadius'
          )}
        />
        <BooleanPropertyRow
          desc={applabMsg.designElementProperty_hidden()}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')}
        />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}
        />
      </div>
    );
  }
}

class TextInputEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
  };

  getChangeEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function( ) {\n\tconsole.log("${id} entered text: " + getText("${id}"));\n}`;
    return `onEvent("${id}", "change", ${callback});`;
  }

  insertChange = () => {
    this.props.onInsertEvent(this.getChangeEventCode());
  };

  getInputEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function( ) {\n\tconsole.log("${id} current text: " + getText("${id}"));\n}`;
    return `onEvent("${id}", "input", ${callback});`;
  }

  insertInput = () => {
    this.props.onInsertEvent(this.getInputEventCode());
  };

  render() {
    const element = this.props.element;

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow
        />
        <EventHeaderRow />
        <EventRow
          name={applabMsg.designElementEvent_change()}
          desc={applabMsg.designElement_textInput_changeEventDesc()}
          handleInsert={this.insertChange}
        />
        <EventRow
          name={applabMsg.designElementEvent_input()}
          desc={applabMsg.designElement_textInput_inputEventDesc()}
          handleInsert={this.insertInput}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: TextInputProperties,
  EventTab: TextInputEvents,
  themeValues: themeValues.textInput,

  create: function () {
    const element = document.createElement('input');
    element.style.margin = '0px';
    element.style.width = '200px';
    element.style.height = '30px';
    element.style.borderStyle = 'solid';
    elementLibrary.setAllPropertiesToCurrentTheme(
      element,
      designMode.activeScreen()
    );

    return element;
  },

  onDeserialize: function (element) {
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element, {textInput: true});
    // Set the font family for older projects that didn't set it on create:
    elementUtils.setDefaultFontFamilyStyle(element);
    // Set the padding for older projects that didn't set it on create:
    if (element.style.padding === '') {
      element.style.padding = CLASSIC_TEXT_INPUT_PADDING;
    }
    // Set the background color for older projects that didn't set it on create:
    if (element.style.backgroundColor === '') {
      element.style.backgroundColor =
        this.themeValues.backgroundColor[themeOptions[CLASSIC_THEME_INDEX]];
    }

    $(element).on('mousedown', function (e) {
      if (!Applab.isRunning()) {
        // Disable clicking into text input unless running
        e.preventDefault();
      }
    });

    // swallow keydown unless we're running
    $(element).on('keydown', function (e) {
      if (!Applab.isRunning()) {
        e.preventDefault();
      }
    });
  },

  onPropertyChange: function (element, name, value) {
    switch (name) {
      case 'value':
        element.value = value;
        break;
      case 'text':
        element.value = value;
        break;
      default:
        return false;
    }
    return true;
  },

  readProperty: function (element, name) {
    switch (name) {
      case 'value':
        return element.value;
      default:
        throw `unknown property name ${name}`;
    }
  },
};
