import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ImagePickerPropertyRow from './ImagePickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import EnumPropertyRow from './EnumPropertyRow';
import FontFamilyPropertyRow from './FontFamilyPropertyRow';
import BorderProperties from './BorderProperties';
import themeColor from '../themeColor';
import {
  ICON_PREFIX_REGEX,
  defaultFontSizeStyle,
  fontFamilyStyles
} from '../constants';
import * as elementUtils from './elementUtils';
import designMode from '../designMode';
import elementLibrary from './library';
import experiments from '../../util/experiments';
import {growToGridSize} from '../gridUtils';

class ButtonProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  };

  handleIconColorChange = value => {
    this.props.handleChange('icon-color', value);
    this.props.handleChange(
      'image',
      this.props.element.getAttribute('data-canonical-image-url')
    );
  };

  render() {
    const element = this.props.element;

    let iconColorPicker;
    const canonicalImage = element.getAttribute('data-canonical-image-url');
    if (ICON_PREFIX_REGEX.test(canonicalImage)) {
      iconColorPicker = (
        <ColorPickerPropertyRow
          desc={'icon color'}
          initialValue={elementUtils.rgb2hex(
            element.getAttribute('data-icon-color') || '#000000'
          )}
          handleChange={this.handleIconColorChange}
        />
      );
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
          initialValue={$(element).text()}
          handleChange={this.props.handleChange.bind(this, 'text')}
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
          initialValue={element.style.textAlign || 'center'}
          options={['left', 'right', 'center', 'justify']}
          handleChange={this.props.handleChange.bind(this, 'textAlign')}
        />
        <ImagePickerPropertyRow
          desc={'image'}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          handleChange={this.props.handleChange.bind(this, 'image')}
          elementId={elementUtils.getId(element)}
        />
        {iconColorPicker}
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

class ButtonEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getClickEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' +
      id +
      '", "click", function(event) {\n' +
      '  console.log("' +
      id +
      ' clicked!");\n' +
      '});\n';
    return code;
  }

  insertClick = () => this.props.onInsertEvent(this.getClickEventCode());

  render() {
    const element = this.props.element;
    const clickName = 'Click';
    const clickDesc =
      'Triggered when the button is clicked with a mouse or tapped on a screen.';

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <EventHeaderRow />
        <EventRow
          name={clickName}
          desc={clickDesc}
          handleInsert={this.insertClick}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: ButtonProperties,
  EventTab: ButtonEvents,
  themeValues: {
    backgroundColor: {
      type: 'color',
      ...themeColor.buttonBackground
    },
    borderRadius: {
      default: 4,
      orange: 0,
      citrus: 2,
      ketchupAndMustard: 5,
      lemonade: 6,
      forest: 6,
      watermelon: 10,
      area51: 10,
      polar: 100,
      glowInTheDark: 10,
      bubblegum: 100,
      millennial: 100,
      robot: 0,
      classic: 0
    },
    borderWidth: {
      default: 1,
      orange: 2,
      citrus: 2,
      ketchupAndMustard: 0,
      lemonade: 0,
      forest: 2,
      watermelon: 4,
      area51: 2,
      polar: 2,
      glowInTheDark: 2,
      bubblegum: 2,
      millennial: 0,
      robot: 2,
      classic: 0
    },
    borderColor: {
      type: 'color',
      ...themeColor.buttonBorder
    },
    textColor: {
      type: 'color',
      ...themeColor.buttonText
    },
    fontFamily: {
      default: 'Arial Black',
      orange: 'Verdana',
      citrus: 'Georgia',
      ketchupAndMustard: 'Georgia',
      lemonade: 'Arial',
      forest: 'Verdana',
      watermelon: 'Georgia',
      area51: 'Arial Black',
      polar: 'Verdana',
      glowInTheDark: 'Tahoma',
      bubblegum: 'Georgia',
      millennial: 'Verdana',
      robot: 'Arial Black',
      classic: 'Arial'
    },
    fontSize: {
      default: 18,
      orange: 18,
      citrus: 18,
      ketchupAndMustard: 18,
      lemonade: 18,
      forest: 18,
      watermelon: 18,
      area51: 18,
      polar: 18,
      glowInTheDark: 18,
      bubblegum: 18,
      millennial: 18,
      robot: 18,
      classic: 14
    }
  },
  create: function() {
    const element = document.createElement('button');
    element.appendChild(document.createTextNode('Button'));
    element.style.padding = '0px';
    element.style.margin = '0px';
    if (experiments.isEnabled('applabThemes')) {
      element.style.borderStyle = 'solid';
      // Roughly scale default size based on the current theme's font size:
      const currentTheme = elementLibrary.getCurrentTheme(
        designMode.activeScreen()
      );
      const fontSize = this.themeValues.fontSize[currentTheme];
      element.style.height = `${growToGridSize(fontSize * 2)}px`;
      element.style.width = `${10 + growToGridSize(fontSize * 5)}px`;
      elementLibrary.applyCurrentTheme(element, designMode.activeScreen());
    } else {
      element.style.height = '30px';
      element.style.width = '80px';
      element.style.fontFamily = fontFamilyStyles[0];
      element.style.fontSize = defaultFontSizeStyle;
      elementUtils.setDefaultBorderStyles(element, {forceDefaults: true});
      element.style.color = themeColor.buttonText.classic;
      element.style.backgroundColor = themeColor.buttonBackground.classic;
    }

    return element;
  },
  onDeserialize: function(element, updateProperty) {
    const url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'image', url);
    }
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element);
    // Set the font family for older projects that didn't set them on create:
    elementUtils.setDefaultFontFamilyStyle(element);
  }
};
