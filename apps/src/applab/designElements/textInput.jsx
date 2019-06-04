import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import EnumPropertyRow from './EnumPropertyRow';
import FontFamilyPropertyRow from './FontFamilyPropertyRow';
import BorderProperties from './BorderProperties';
import * as elementUtils from './elementUtils';
import designMode from '../designMode';
import {
  defaultFontSizeStyle,
  fontFamilyStyles,
  themeOptions,
  CLASSIC_THEME_INDEX
} from '../constants';
import themeColor from '../themeColor';
import elementLibrary from './library';
import experiments from '../../util/experiments';

class TextInputProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  };

  render() {
    const element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow
        />
        <PropertyRow
          desc={'placeholder'}
          initialValue={element.getAttribute('placeholder') || ''}
          handleChange={this.props.handleChange.bind(this, 'placeholder')}
        />
        <PropertyRow
          desc={'width (px)'}
          isNumber
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={'height (px)'}
          isNumber
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={'x position (px)'}
          isNumber
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={'y position (px)'}
          isNumber
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <ColorPickerPropertyRow
          desc={'text color'}
          initialValue={elementUtils.rgb2hex(element.style.color)}
          handleChange={this.props.handleChange.bind(this, 'textColor')}
        />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
        />
        <FontFamilyPropertyRow
          initialValue={designMode.fontFamilyOptionFromStyle(
            element.style.fontFamily
          )}
          handleChange={this.props.handleChange.bind(this, 'fontFamily')}
        />
        <PropertyRow
          desc={'font size (px)'}
          isNumber
          initialValue={parseInt(element.style.fontSize, 10)}
          handleChange={this.props.handleChange.bind(this, 'fontSize')}
        />
        <EnumPropertyRow
          desc={'text alignment'}
          initialValue={element.style.textAlign || 'left'}
          options={['left', 'right', 'center', 'justify']}
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
          desc={'hidden'}
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
    onInsertEvent: PropTypes.func.isRequired
  };

  getChangeEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' +
      id +
      '", "change", function(event) {\n' +
      '  console.log("' +
      id +
      ' entered text: " + getText("' +
      id +
      '"));\n' +
      '});\n';
    return code;
  }

  insertChange = () => {
    this.props.onInsertEvent(this.getChangeEventCode());
  };

  getInputEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' +
      id +
      '", "input", function(event) {\n' +
      '  console.log("' +
      id +
      ' current text: " + getText("' +
      id +
      '"));\n' +
      '});\n';
    return code;
  }

  insertInput = () => {
    this.props.onInsertEvent(this.getInputEventCode());
  };

  render() {
    const element = this.props.element;

    const changeName = 'Change';
    const changeDesc =
      'Triggered when the text input loses focus if the text has changed.';

    const inputName = 'Input';
    const inputDesc =
      'Triggered immediately every time the text input contents change.';

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow
        />
        <EventHeaderRow />
        <EventRow
          name={changeName}
          desc={changeDesc}
          handleInsert={this.insertChange}
        />
        <EventRow
          name={inputName}
          desc={inputDesc}
          handleInsert={this.insertInput}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: TextInputProperties,
  EventTab: TextInputEvents,
  themeValues: {
    backgroundColor: {
      type: 'color',
      ...themeColor.textInputBackground
    },
    borderRadius: {
      default: 4,
      orange: 0,
      citrus: 4,
      ketchupAndMustard: 5,
      lemonade: 4,
      forest: 4,
      watermelon: 0,
      area51: 10,
      polar: 4,
      glowInTheDark: 0,
      bubblegum: 4,
      millennial: 4,
      robot: 0,
      classic: 0
    },
    borderWidth: {
      default: 1,
      orange: 1,
      citrus: 1,
      ketchupAndMustard: 1,
      lemonade: 1,
      forest: 1,
      watermelon: 2,
      area51: 1,
      polar: 1,
      glowInTheDark: 1,
      bubblegum: 1,
      millennial: 2,
      robot: 1,
      classic: 1
    },
    borderColor: {
      type: 'color',
      ...themeColor.textInputBorder
    },
    textColor: {
      type: 'color',
      ...themeColor.textInput
    },
    fontFamily: {
      default: 'Arial',
      orange: 'Arial',
      citrus: 'Palatino',
      ketchupAndMustard: 'Tahoma',
      lemonade: 'Arial',
      forest: 'Arial',
      watermelon: 'Georgia',
      area51: 'Trebuchet',
      polar: 'Verdana',
      glowInTheDark: 'Tahoma',
      bubblegum: 'Trebuchet',
      millennial: 'Arial',
      robot: 'Tahoma',
      classic: 'Arial'
    },
    fontSize: {
      default: 15,
      orange: 15,
      citrus: 15,
      ketchupAndMustard: 15,
      lemonade: 15,
      forest: 15,
      watermelon: 15,
      area51: 15,
      polar: 15,
      glowInTheDark: 15,
      bubblegum: 15,
      millennial: 15,
      robot: 15,
      classic: 14
    }
  },

  create: function() {
    const element = document.createElement('input');
    element.style.margin = '0px';
    element.style.width = '200px';
    element.style.height = '30px';
    if (experiments.isEnabled('applabThemes')) {
      element.style.borderStyle = 'solid';
      elementLibrary.applyCurrentTheme(element, designMode.activeScreen());
    } else {
      element.style.fontFamily = fontFamilyStyles[0];
      element.style.fontSize = defaultFontSizeStyle;
      element.style.color = themeColor.textInput.classic;
      element.style.backgroundColor = '';
      elementUtils.setDefaultBorderStyles(element, {
        forceDefaults: true,
        textInput: true
      });
    }

    return element;
  },

  onDeserialize: function(element) {
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element, {textInput: true});
    // Set the font family for older projects that didn't set it on create:
    elementUtils.setDefaultFontFamilyStyle(element);
    if (experiments.isEnabled('applabThemes')) {
      // Set the background color for older projects that didn't set it on create:
      if (element.style.backgroundColor === '') {
        element.style.backgroundColor = this.themeValues.backgroundColor[
          themeOptions[CLASSIC_THEME_INDEX]
        ];
      }
    }

    $(element).on('mousedown', function(e) {
      if (!Applab.isRunning()) {
        // Disable clicking into text input unless running
        e.preventDefault();
      }
    });

    // swallow keydown unless we're running
    $(element).on('keydown', function(e) {
      if (!Applab.isRunning()) {
        e.preventDefault();
      }
    });
  },

  onPropertyChange: function(element, name, value) {
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

  readProperty: function(element, name) {
    switch (name) {
      case 'value':
        return element.value;
      default:
        throw `unknown property name ${name}`;
    }
  }
};
