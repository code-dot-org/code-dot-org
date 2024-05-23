import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import {getStore} from '../../redux';
import * as applabConstants from '../constants';
import designMode from '../designMode';
import themeValues from '../themeValues';

import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import DefaultScreenButtonPropertyRow from './DefaultScreenButtonPropertyRow';
import * as elementUtils from './elementUtils';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import ImagePickerPropertyRow from './ImagePickerPropertyRow';
import elementLibrary from './library';
import PropertyRow from './PropertyRow';

class ScreenProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
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
          isIdRow={true}
        />
        <ColorPickerPropertyRow
          desc={applabMsg.designElementProperty_backgroundColor()}
          initialValue={element.style.backgroundColor}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
        />
        <ImagePickerPropertyRow
          desc={applabMsg.designElementProperty_image()}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          currentImageType={element.getAttribute('data-image-type') || ''}
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
    onInsertEvent: PropTypes.func.isRequired,
  };

  // The screen click event handler code currently receives clicks to any
  // other design element. This could be worked around by checking for
  // event.targetId === "<id>" here, at the expense of added complexity.
  getClickEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function( ) {\n\tconsole.log("${id} clicked!");\n}`;
    return `onEvent("${id}", "click", ${callback});`;
  }

  insertClick = () => {
    this.props.onInsertEvent(this.getClickEventCode());
  };

  getKeyEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function(event) {\n\tconsole.log("Key pressed: " + event.key);\n}`;
    return `onEvent("${id}", "keydown", ${callback});`;
  }

  insertKey = () => {
    this.props.onInsertEvent(this.getKeyEventCode());
  };

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
          desc={applabMsg.designElement_screen_clickEventDesc()}
          handleInsert={this.insertClick}
        />
        <EventRow
          name={applabMsg.designElementEvent_key()}
          desc={applabMsg.designElement_screen_keyEventDesc()}
          handleInsert={this.insertKey}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: ScreenProperties,
  EventTab: ScreenEvents,
  themeValues: themeValues.screen,

  create: function () {
    const width = applabConstants.getAppWidth(
      getStore().getState().pageConstants
    );
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
  onDeserialize: function (element, updateProperty) {
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
      element.style.backgroundColor =
        this.themeValues.backgroundColor[
          applabConstants.themeOptions[applabConstants.CLASSIC_THEME_INDEX]
        ];
    }
  },
  readProperty: function (element, name) {
    if (name === 'theme') {
      return element.getAttribute('data-theme');
    }
    throw `unknown property name ${name}`;
  },
  onPropertyChange: function (element, name, value) {
    if (name === 'theme') {
      designMode.changeThemeForScreen(element, value);
      return true;
    }
    return false;
  },
};
