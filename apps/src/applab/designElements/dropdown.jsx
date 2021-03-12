import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import OptionsSelectRow from './OptionsSelectRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import themeValues, {CLASSIC_DROPDOWN_PADDING} from '../themeValues';
import EnumPropertyRow from './EnumPropertyRow';
import BorderProperties from './BorderProperties';
import FontFamilyPropertyRow from './FontFamilyPropertyRow';
import * as elementUtils from './elementUtils';
import designMode from '../designMode';
import elementLibrary from './library';
import RGBColor from 'rgbcolor';

class DropdownProperties extends React.Component {
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
        <OptionsSelectRow
          desc={'options'}
          element={element}
          handleChange={this.props.handleChange.bind(this, 'options')}
        />
        <PropertyRow
          desc={'index'}
          isNumber
          initialValue={parseInt(element.selectedIndex, 10)}
          handleChange={this.props.handleChange.bind(this, 'index')}
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
          initialValue={element.style.color}
          handleChange={this.props.handleChange.bind(this, 'textColor')}
        />
        <ColorPickerPropertyRow
          desc={'background color'}
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

    // TODO:
    // bold/italics/underline (p2)
    // enabled (p2)
  }
}

class DropdownEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getChangeEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function( ) {\n\tconsole.log("Selected option: " + getText("${id}"));\n}`;
    return `onEvent("${id}", "change", ${callback});`;
  }

  insertChange = () => {
    this.props.onInsertEvent(this.getChangeEventCode());
  };

  render() {
    const element = this.props.element;
    const changeName = 'Change';
    const changeDesc =
      'Triggered every time an option is selected from the dropdown.';

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

const svgArrowUrl = color =>
  `url(data:image/svg+xml;charset=US-ASCII,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 448" enable-background="new 0 0 256 448"><style type="text/css">.arrow{fill:${color};}</style><path class="arrow" d="M255.9 168c0-4.2-1.6-7.9-4.8-11.2-3.2-3.2-6.9-4.8-11.2-4.8H16c-4.2 0-7.9 1.6-11.2 4.8S0 163.8 0 168c0 4.4 1.6 8.2 4.8 11.4l112 112c3.1 3.1 6.8 4.6 11.2 4.6 4.4 0 8.2-1.5 11.4-4.6l112-112c3-3.2 4.5-7 4.5-11.4z"/></svg>`
  )})`;

export default {
  PropertyTab: DropdownProperties,
  EventTab: DropdownEvents,
  themeValues: themeValues.dropdown,

  create: function() {
    const element = document.createElement('select');
    element.style.width = '200px';
    element.style.height = '30px';
    element.style.margin = '0';
    element.style.borderStyle = 'solid';
    elementLibrary.setAllPropertiesToCurrentTheme(
      element,
      designMode.activeScreen()
    );

    const option1 = document.createElement('option');
    option1.innerHTML = 'Option 1';
    element.appendChild(option1);

    const option2 = document.createElement('option');
    option2.innerHTML = 'Option 2';
    element.appendChild(option2);

    return element;
  },

  onDeserialize: function(element) {
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element);
    // Set the font family for older projects that didn't set it on create:
    elementUtils.setDefaultFontFamilyStyle(element);
    // Set the dropdown SVG for older projects that didn't have them:
    if (!element.style.backgroundImage) {
      element.style.backgroundImage = svgArrowUrl(
        new RGBColor(element.style.color).toHex()
      );
    }
    // Set the padding for older projects that didn't set it on create:
    if (element.style.padding === '') {
      element.style.padding = CLASSIC_DROPDOWN_PADDING;
    }

    // In the future we may want to trigger this on focus events as well.
    $(element).on('mousedown', function(e) {
      if (!Applab.isRunning()) {
        // Disable dropdown menu unless running
        e.preventDefault();
        this.blur();
        window.focus();
      }
    });
  },

  onPropertyChange: function(element, name, value) {
    switch (name) {
      case 'value':
        element.value = value;
        break;
      case 'text':
        // Overrides generic text setter and sets from the dropdown options
        element.value = value;
        break;
      case 'textColor':
        element.style.backgroundImage = svgArrowUrl(
          new RGBColor(element.style.color).toHex()
        );
        break;
      case 'index':
        element.selectedIndex = value;
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
      case 'index':
        return element.selectedIndex;
      default:
        throw `unknown property name ${name}`;
    }
  }
};
