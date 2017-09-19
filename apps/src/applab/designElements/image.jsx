import $ from 'jquery';
import React, {PropTypes} from 'react';
import PropertyRow from './PropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ImagePickerPropertyRow from './ImagePickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import {ICON_PREFIX_REGEX} from '../constants';
import * as elementUtils from './elementUtils';

class ImageProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired
  };

  handleIconColorChange = (value) => {
    this.props.handleChange('icon-color', value);
    this.props.handleChange('picture',
      this.props.element.getAttribute('data-canonical-image-url'));
  };

  render() {
    const element = this.props.element;

    let iconColorPicker;
    const canonicalImage = element.getAttribute('data-canonical-image-url');
    if (ICON_PREFIX_REGEX.test(canonicalImage)) {
      iconColorPicker = (
        <ColorPickerPropertyRow
          desc={'icon color'}
          initialValue={elementUtils.rgb2hex(element.getAttribute('data-icon-color') || '#000000')}
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
          isIdRow={true}
        />
        <PropertyRow
          desc={'width (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={'height (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={'x position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={'y position (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <ImagePickerPropertyRow
          desc={'image'}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          handleChange={this.props.handleChange.bind(this, 'picture')}
        />
        {iconColorPicker}
        <BooleanPropertyRow
          desc={'hidden'}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')}
        />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}
        />
      </div>);

    // TODO (brent):
    // bold/italics/underline (p2)
    // shape (p2)
    // textAlignment (p2)
    // enabled (p2)
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
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '});\n';
    return code;
  }

  insertClick = () => {
    this.props.onInsertEvent(this.getClickEventCode());
  };

  render() {
    const element = this.props.element;
    const clickName = 'Click';
    const clickDesc = 'Triggered when the image is clicked with a mouse or tapped on a screen.';

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={'id'}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <EventHeaderRow/>
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
  PropertyTab: ImageProperties,
  EventTab: ImageEvents,

  create: function () {
    const element = document.createElement('img');
    element.style.height = '100px';
    element.style.width = '100px';
    element.setAttribute('src', '/blockly/media/1x1.gif');
    element.setAttribute('data-canonical-image-url', '');

    return element;
  },
  onDeserialize: function (element, updateProperty) {
    const url = element.getAttribute('data-canonical-image-url') || '';
    if (url) {
      updateProperty(element, 'picture', url);
    } else {
      element.setAttribute('src', '/blockly/media/1x1.gif');
      element.setAttribute('data-canonical-image-url', '');
    }
  }
};
