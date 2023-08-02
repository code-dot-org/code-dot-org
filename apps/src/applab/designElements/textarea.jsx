import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import applabMsg from '@cdo/applab/locale';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import FontFamilyPropertyRow from './FontFamilyPropertyRow';
import TextAlignmentPropertyRow, {
  TEXT_ALIGNMENT_LEFT,
} from './TextAlignmentPropertyRow';
import BorderProperties from './BorderProperties';
import * as utils from '../../utils';
import * as elementUtils from './elementUtils';
import designMode from '../designMode';
import themeValues, {CLASSIC_TEXT_AREA_PADDING} from '../themeValues';
import elementLibrary from './library';

class TextAreaProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
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
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_text()}
          isMultiLine
          initialValue={escapedText}
          handleChange={this.props.handleChange.bind(this, 'text')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_widthPx()}
          isNumber
          initialValue={parseInt(element.style.width, 10)}
          foo={parseInt(element.style.width, 10)}
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
          desc={applabMsg.designElementProperty_readOnly()}
          initialValue={!element.isContentEditable}
          handleChange={this.props.handleChange.bind(this, 'readonly')}
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

    // TODO:
    // bold/italics/underline (p2)
    // enabled (p2)
  }
}

class TextAreaEvents extends React.Component {
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
          desc={applabMsg.designElement_textArea_changeEventDesc()}
          handleInsert={this.insertChange}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: TextAreaProperties,
  EventTab: TextAreaEvents,
  themeValues: themeValues.textArea,

  create: function () {
    const element = document.createElement('div');
    element.setAttribute('contenteditable', true);
    element.style.width = '200px';
    element.style.height = '100px';
    element.style.borderStyle = 'solid';
    elementLibrary.setAllPropertiesToCurrentTheme(
      element,
      designMode.activeScreen()
    );

    $(element).addClass('textArea');

    this.onDeserialize(element);

    return element;
  },

  onDeserialize: function (element) {
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element, {textInput: true});
    // Set the font family for older projects that didn't set it on create:
    elementUtils.setDefaultFontFamilyStyle(element);
    // Set the padding for older projects that didn't set it on create:
    if (element.style.padding === '') {
      element.style.padding = CLASSIC_TEXT_AREA_PADDING;
    }

    $(element).addClass('textArea');

    $(element).on('mousedown', function (e) {
      if (!Applab.isRunning()) {
        // Disable clicking into text area unless running
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
};
