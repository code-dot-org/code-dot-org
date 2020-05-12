import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import BorderProperties from './BorderProperties';
import themeValues from '../themeValues';
import {ICON_PREFIX_REGEX} from '../constants';
import * as elementUtils from './elementUtils';
import * as assetPrefix from '../../assetManagement/assetPrefix';
import designMode from '../designMode';
import elementLibrary from './library';

class PhotoChooserProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  };

  handleChangeWrapper = value => {
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
          handleChange={this.handleChangeWrapper}
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
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
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

class PhotoChooserEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getPhotoselectEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code = `onEvent("${id}", "change", function() {\n  console.log("${id} photo selected!");\n  console.log(getImageURL("${id}"));\n});\n`;
    return code;
  }

  insertPhotoselect = () =>
    this.props.onInsertEvent(this.getPhotoselectEventCode());

  render() {
    const element = this.props.element;
    const clickName = 'Change';
    const clickDescription = 'Triggered when a photo is selected.';

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
          desc={clickDescription}
          handleInsert={this.insertPhotoselect}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: PhotoChooserProperties,
  EventTab: PhotoChooserEvents,
  themeValues: themeValues.photoSelect,

  create: function() {
    const element = document.createElement('label');
    element.setAttribute('class', 'img-upload');
    element.setAttribute('data-canonical-image-url', 'icon://fa-camera');
    element.style.margin = '0';
    element.style.lineHeight = '1';
    element.style.borderStyle = 'solid';
    element.style.fontFamily = 'FontAwesome';
    element.style.content = '\f030';

    /*elementLibrary.setAllPropertiesToCurrentTheme(
      element,
      designMode.activeScreen()
    );*/
    /*element.style.backgroundSize = 'contain';
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundPosition = '50% 50%';
    element.style.backgroundImage =
      'url(' +
      assetPrefix.renderIconToString(
        element.getAttribute('data-canonical-image-url'),
        element
      ) +
      ')';*/

    element.style.width = '75px';
    element.style.height = '50px';
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.accept = 'image/*';
    newInput.capture = 'camera';
    newInput.hidden = true;
    element.appendChild(newInput);
    return element;
  },
  onDeserialize: function(element, updateProperty) {
    // Disable image upload events unless running
    $(element).on('click', () => {
      if (Applab.isRunning()) {
        element.childNodes[0].disabled = false;
      } else {
        element.childNodes[0].disabled = true;
      }
    });
    const url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'image', url);
    }
  }
};
