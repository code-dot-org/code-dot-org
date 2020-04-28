import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ImagePickerPropertyRow from './ImagePickerPropertyRow';
import ThemePropertyRow from './ThemePropertyRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import DefaultScreenButtonPropertyRow from './DefaultScreenButtonPropertyRow';
import designMode from '../designMode';
import elementLibrary from './library';
import * as applabConstants from '../constants';
import * as elementUtils from './elementUtils';
import themeValues from '../themeValues';
import {getStore} from '../../redux';

class ScreenProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired
  };

  handleIconColorChange = value => {
    this.props.handleChange('icon-color', value);
    this.props.handleChange(
      'screen-image',
      this.props.element.getAttribute('data-canonical-image-url')
    );
  };

  render() {
    const element = this.props.element;

    let iconColorPicker;
    const canonicalImage = element.getAttribute('data-canonical-image-url');
    if (applabConstants.ICON_PREFIX_REGEX.test(canonicalImage)) {
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
          isIdRow={true}
        />
        <ThemePropertyRow
          initialValue={element.getAttribute('data-theme')}
          handleChange={this.props.handleChange.bind(this, 'theme')}
        />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
        />
        <ImagePickerPropertyRow
          desc={'image'}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          handleChange={this.props.handleChange.bind(this, 'screen-image')}
          elementId={elementUtils.getId(element)}
        />
        {iconColorPicker}
        <DefaultScreenButtonPropertyRow
          screenId={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'is-default')}
        />
      </div>
    );
  }
}

class ScreenEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  // The screen click event handler code currently receives clicks to any
  // other design element. This could be worked around by checking for
  // event.targetId === "<id>" here, at the expense of added complexity.
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

  getKeyEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' +
      id +
      '", "keydown", function(event) {\n' +
      '  console.log("Key: " + event.key);\n' +
      '});\n';
    return code;
  }

  insertKey = () => {
    this.props.onInsertEvent(this.getKeyEventCode());
  };

  render() {
    const element = this.props.element;
    const clickName = 'Click';
    const clickDesc =
      'Triggered when the screen is clicked with a mouse or tapped on a screen.';
    const keyName = 'Key';
    const keyDesc = 'Triggered when a key is pressed.';

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
        <EventRow name={keyName} desc={keyDesc} handleInsert={this.insertKey} />
      </div>
    );
  }
}

export default {
  PropertyTab: ScreenProperties,
  EventTab: ScreenEvents,
  themeValues: themeValues.screen,

  create: function() {
    let pageConstants = getStore().getState().pageConstants;
    let width =
      pageConstants && pageConstants.widgetMode
        ? applabConstants.WIDGET_WIDTH
        : applabConstants.APP_WIDTH;
    const element = document.createElement('div');
    element.setAttribute('class', 'screen');
    element.setAttribute('tabIndex', '1');
    element.style.display = 'block';
    element.style.height =
      applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT + 'px';
    element.style.width = width + 'px';
    element.style.left = '0px';
    element.style.top = '0px';
    // We want our screen to be behind canvases. By setting any z-index on the
    // screen element, we create a new stacking context with this div as its
    // root, which results in all children (including canvas) to appear in front
    // of it, regardless of their z-index value.
    // see http://philipwalton.com/articles/what-no-one-told-you-about-z-index/
    element.style.position = 'absolute';
    element.style.zIndex = 0;
    // New screens are created with the same theme as is currently active
    const currentTheme = elementLibrary.getCurrentTheme(
      designMode.activeScreen()
    );
    element.setAttribute('data-theme', currentTheme);
    elementLibrary.setAllPropertiesToCurrentTheme(element, element);

    return element;
  },
  onDeserialize: function(element, updateProperty) {
    const url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'screen-image', url);
    }
    // Properly position existing screens, so that canvases appear correctly.
    element.style.position = 'absolute';
    element.style.zIndex = 0;
    element.setAttribute('tabIndex', '1');

    if (!element.getAttribute('data-theme')) {
      element.setAttribute(
        'data-theme',
        applabConstants.themeOptions[applabConstants.CLASSIC_THEME_INDEX]
      );
    }

    if (element.style.backgroundColor === '') {
      element.style.backgroundColor = this.themeValues.backgroundColor[
        applabConstants.themeOptions[applabConstants.CLASSIC_THEME_INDEX]
      ];
    }
  },
  readProperty: function(element, name) {
    if (name === 'theme') {
      return element.getAttribute('data-theme');
    }
    throw `unknown property name ${name}`;
  },
  onPropertyChange: function(element, name, value) {
    if (name === 'theme') {
      designMode.changeThemeForScreen(element, value);
      return true;
    }
    return false;
  }
};
