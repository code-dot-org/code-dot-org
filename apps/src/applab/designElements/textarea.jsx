import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import FontFamilyPropertyRow from './FontFamilyPropertyRow';
import BorderProperties from './BorderProperties';
import * as utils from '../../utils';
import * as elementUtils from './elementUtils';
import EnumPropertyRow from './EnumPropertyRow';
import designMode from '../designMode';
import {defaultFontSizeStyle, fontFamilyStyles} from '../constants';
import themeColor from '../themeColor';
import elementLibrary from './library';
import experiments from '../../util/experiments';

class TextAreaProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  };

  render() {
    const element = this.props.element;

    let escapedText = '';
    if (element.parentElement.className === 'textArea') {
      escapedText = utils.unescapeText(element.parentElement.innerHTML);
    } else {
      escapedText = utils.unescapeText(element.innerHTML);
    }

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow
        />
        <PropertyRow
          desc={'text'}
          isMultiLine
          initialValue={escapedText}
          handleChange={this.props.handleChange.bind(this, 'text')}
        />
        <PropertyRow
          desc={'width (px)'}
          isNumber
          initialValue={parseInt(element.style.width, 10)}
          foo={parseInt(element.style.width, 10)}
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
          desc={'read only'}
          initialValue={!element.isContentEditable}
          handleChange={this.props.handleChange.bind(this, 'readonly')}
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

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
}

class TextAreaEvents extends React.Component {
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

  render() {
    const element = this.props.element;
    const changeName = 'Change';
    const changeDesc =
      'Triggered when the text area loses focus if the text has changed.';

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
      </div>
    );
  }
}

export default {
  PropertyTab: TextAreaProperties,
  EventTab: TextAreaEvents,
  themeValues: {
    backgroundColor: {
      type: 'color',
      ...themeColor.textAreaBackground
    },
    borderRadius: {
      default: 2,
      orange: 2,
      citrus: 4,
      ketchupAndMustard: 5,
      lemonade: 6,
      forest: 5,
      watermelon: 20,
      area51: 20,
      polar: 8,
      glowInTheDark: 0,
      bubblegum: 8,
      millennial: 8,
      robot: 0,
      classic: 0
    },
    borderWidth: {
      default: 1,
      orange: 0,
      citrus: 0,
      ketchupAndMustard: 2,
      lemonade: 0,
      forest: 0,
      watermelon: 0,
      area51: 0,
      polar: 2,
      glowInTheDark: 0,
      bubblegum: 0,
      millennial: 0,
      robot: 1,
      classic: 1
    },
    borderColor: {
      type: 'color',
      ...themeColor.textAreaBorder
    },
    textColor: {
      type: 'color',
      ...themeColor.textArea
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
      polar: 'Arial',
      glowInTheDark: 'Tahoma',
      bubblegum: 'Trebuchet',
      millennial: 'Arial',
      robot: 'Tahoma',
      classic: 'Arial'
    },
    fontSize: {
      default: 13,
      orange: 13,
      citrus: 13,
      ketchupAndMustard: 13,
      lemonade: 13,
      forest: 13,
      watermelon: 13,
      area51: 13,
      polar: 13,
      glowInTheDark: 13,
      bubblegum: 13,
      millennial: 13,
      robot: 13,
      classic: 14
    }
  },

  create: function() {
    const element = document.createElement('div');
    element.setAttribute('contenteditable', true);
    element.style.width = '200px';
    element.style.height = '100px';
    if (experiments.isEnabled('applabThemes')) {
      element.style.borderStyle = 'solid';
      elementLibrary.applyCurrentTheme(element, designMode.activeScreen());
    } else {
      element.style.fontFamily = fontFamilyStyles[0];
      element.style.fontSize = defaultFontSizeStyle;
      element.style.color = themeColor.textArea.classic;
      element.style.backgroundColor = themeColor.textAreaBackground.classic;
      elementUtils.setDefaultBorderStyles(element, {
        forceDefaults: true,
        textInput: true
      });
    }

    $(element).addClass('textArea');

    this.onDeserialize(element);

    return element;
  },

  onDeserialize: function(element) {
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element, {textInput: true});
    // Set the font family for older projects that didn't set them on create:
    elementUtils.setDefaultFontFamilyStyle(element);

    $(element).addClass('textArea');

    $(element).on('mousedown', function(e) {
      if (!Applab.isRunning()) {
        // Disable clicking into text area unless running
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
        element.innerHTML = value;
        break;
      default:
        return false;
    }
    return true;
  },

  readProperty: function(element, name) {
    switch (name) {
      case 'value':
        return element.innerHTML;
      default:
        throw `unknown property name ${name}`;
    }
  }
};
