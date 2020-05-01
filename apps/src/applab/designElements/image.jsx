import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ImagePickerPropertyRow from './ImagePickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import {ICON_PREFIX_REGEX} from '../constants';
import EnumPropertyRow from './EnumPropertyRow';
import BorderProperties from './BorderProperties';
import * as elementUtils from './elementUtils';
import {applabObjectFitImages} from '../applabObjectFitImages';

class ImageProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  };

  handleIconColorChange = value => {
    this.props.handleChange('icon-color', value);
    this.props.handleChange(
      'picture',
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
        <ImagePickerPropertyRow
          desc={'image'}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          currentImageType={element.getAttribute('data-image-type') || ''}
          handleChange={this.props.handleChange.bind(this, 'picture')}
          elementId={elementUtils.getId(element)}
        />
        {iconColorPicker}
        <EnumPropertyRow
          desc={'fit image'}
          initialValue={element.style.objectFit || 'fill'}
          options={['fill', 'cover', 'contain', 'none']}
          handleChange={this.props.handleChange.bind(this, 'objectFit')}
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

class ImageEvents extends React.Component {
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

  insertClick = () => {
    this.props.onInsertEvent(this.getClickEventCode());
  };

  render() {
    const element = this.props.element;
    const clickName = 'Click';
    const clickDesc =
      'Triggered when the image is clicked with a mouse or tapped on a screen.';

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
          name={clickName}
          desc={clickDesc}
          handleInsert={this.insertClick}
        />
      </div>
    );
  }
}

function setObjectFitStyles(element, value, forceObjectFitNow) {
  // NOTE: neither of these will be saved (we strip these out when we serialize
  // and rely on our custom data-object-fit attribute during save/load)

  // Set a style for modern browsers:
  element.style.objectFit = value;

  // Set a style that will be picked up by objectFitImages() for old browsers:
  element.style.fontFamily = `'object-fit: ${value};'`;
  if (forceObjectFitNow) {
    //
    // Enable polyfill for this element so we can use object-fit (it relies on
    // the style in font-family and avoid scale-down & using it in media queries)
    // See https://www.npmjs.com/package/object-fit-images for details.
    //
    applabObjectFitImages(element);
  }
}

export default {
  PropertyTab: ImageProperties,
  EventTab: ImageEvents,

  create: function() {
    const element = document.createElement('img');
    element.style.height = '100px';
    element.style.width = '100px';
    elementUtils.setDefaultBorderStyles(element, {forceDefaults: true});
    element.setAttribute('src', '/blockly/media/1x1.gif');
    element.setAttribute('data-canonical-image-url', '');
    element.setAttribute('data-image-type', '');

    // New elements are created with 'contain', but the default value for
    // existing (unadorned) images is 'fill' for compatibility reasons
    element.setAttribute('data-object-fit', 'contain');
    setObjectFitStyles(element, 'contain', true);

    return element;
  },
  onDeserialize: function(element, updateProperty) {
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element);

    const url = element.getAttribute('data-canonical-image-url') || '';
    if (url) {
      updateProperty(element, 'picture', url);
    } else {
      element.setAttribute('src', '/blockly/media/1x1.gif');
      element.setAttribute('data-canonical-image-url', '');
    }
    const objectFitValue = element.getAttribute('data-object-fit');
    if (objectFitValue) {
      //
      // NOTE: not passing forceObjectFitNow because IE will crash when it
      // is called here and also within makeDraggable() - which is called while
      // in parseScreenFromLevelHtml()
      //
      setObjectFitStyles(element, objectFitValue);
    }
  },
  onPropertyChange: function(element, name, value) {
    switch (name) {
      case 'objectFit':
        element.setAttribute('data-object-fit', value);
        setObjectFitStyles(element, value, true);
        break;
      default:
        return false;
    }
    return true;
  },
  readProperty: function(element, name) {
    switch (name) {
      case 'objectFit':
        return element.getAttribute('data-object-fit');
      default:
        throw `unknown property name ${name}`;
    }
  }
};
