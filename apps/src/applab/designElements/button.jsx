import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import {ICON_PREFIX_REGEX} from '../constants';
import designMode from '../designMode';
import themeValues from '../themeValues';

import BooleanPropertyRow from './BooleanPropertyRow';
import BorderProperties from './BorderProperties';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import * as elementUtils from './elementUtils';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import FontFamilyPropertyRow from './FontFamilyPropertyRow';
import ImagePickerPropertyRow from './ImagePickerPropertyRow';
import elementLibrary from './library';
import PropertyRow from './PropertyRow';
import TextAlignmentPropertyRow, {
  TEXT_ALIGNMENT_CENTER,
} from './TextAlignmentPropertyRow';
import ZOrderRow from './ZOrderRow';

class ButtonProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
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
          desc={applabMsg.designElementProperty_iconColor()}
          initialValue={element.getAttribute('data-icon-color') || '#000000'}
          handleChange={this.handleIconColorChange}
        />
      );
    }

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_text()}
          initialValue={$(element).text()}
          handleChange={this.props.handleChange.bind(this, 'text')}
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
          initialValue={element.style.textAlign || TEXT_ALIGNMENT_CENTER}
          handleChange={this.props.handleChange.bind(this, 'textAlign')}
        />
        <ImagePickerPropertyRow
          desc={applabMsg.designElementProperty_image()}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          currentImageType={element.getAttribute('data-image-type') || ''}
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

class ButtonEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
  };

  getClickEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function( ) {\n\tconsole.log("${id} clicked!");\n}`;
    return `onEvent("${id}", "click", ${callback});`;
  }

  insertClick = () => this.props.onInsertEvent(this.getClickEventCode());

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
          name={applabMsg.designElementEvent_click()}
          desc={applabMsg.designElement_button_clickEventDesc()}
          handleInsert={this.insertClick}
        />
      </div>
    );
  }
}

// Initial button size when fontSize is 14 or smaller is 80x30 (classic theme)
// Initial button size when fontSize is 15 or greater is 100x40 (new themes)
const MAX_SMALL_FONT_SIZE = 14;
const DEFAULT_BUTTON_WIDTH = '100px';
const DEFAULT_BUTTON_WIDTH_SMALL = '80px';
const DEFAULT_BUTTON_HEIGHT = '40px';
const DEFAULT_BUTTON_HEIGHT_SMALL = '30px';

export default {
  PropertyTab: ButtonProperties,
  EventTab: ButtonEvents,
  themeValues: themeValues.button,

  create: function () {
    const element = document.createElement('button');
    element.appendChild(document.createTextNode('Button'));
    element.style.padding = '0px';
    element.style.margin = '0px';
    element.style.borderStyle = 'solid';
    const currentTheme = elementLibrary.getCurrentTheme(
      designMode.activeScreen()
    );
    const fontSize = this.themeValues.fontSize[currentTheme];
    const fontIsSmall = fontSize <= MAX_SMALL_FONT_SIZE;
    element.style.height = fontIsSmall
      ? DEFAULT_BUTTON_HEIGHT_SMALL
      : DEFAULT_BUTTON_HEIGHT;
    element.style.width = fontIsSmall
      ? DEFAULT_BUTTON_WIDTH_SMALL
      : DEFAULT_BUTTON_WIDTH;
    elementLibrary.setAllPropertiesToCurrentTheme(
      element,
      designMode.activeScreen()
    );

    return element;
  },
  onDeserialize: function (element, updateProperty) {
    const url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'image', url);
    }
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element);
    // Set the font family for older projects that didn't set them on create:
    elementUtils.setDefaultFontFamilyStyle(element);
  },
};
