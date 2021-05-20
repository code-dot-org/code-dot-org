import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import * as elementUtils from './elementUtils';

class SliderProperties extends React.Component {
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
        <PropertyRow
          desc={'value'}
          isNumber={true}
          initialValue={element.defaultValue}
          handleChange={this.props.handleChange.bind(this, 'defaultValue')}
        />
        <PropertyRow
          desc={'minimum value'}
          isNumber={true}
          initialValue={parseInt(element.min, 10)}
          handleChange={this.props.handleChange.bind(this, 'min')}
        />
        <PropertyRow
          desc={'maximum value'}
          isNumber={true}
          initialValue={parseInt(element.max, 10)}
          handleChange={this.props.handleChange.bind(this, 'max')}
        />
        <PropertyRow
          desc={'step size'}
          isNumber={true}
          initialValue={parseInt(element.step, 10)}
          handleChange={this.props.handleChange.bind(this, 'step')}
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

class SliderEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getInputEventCode() {
    const id = elementUtils.getId(this.props.element);
    const callback = `function( ) {\n\tconsole.log("${id} value: " + getNumber("${id}"));\n}`;
    return `onEvent("${id}", "input", ${callback});`;
  }

  insertInput = () => {
    this.props.onInsertEvent(this.getInputEventCode());
  };

  render() {
    const element = this.props.element;

    const inputName = 'Input';
    const inputDesc = 'Triggered whenever the value of the slider is modified.';

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
          name={inputName}
          desc={inputDesc}
          handleInsert={this.insertInput}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: SliderProperties,
  EventTab: SliderEvents,

  create: function() {
    const element = document.createElement('input');
    element.type = 'range';
    element.style.margin = '0px';
    element.style.padding = '0px';
    element.style.width = '150px';
    element.style.height = '24px';
    element.defaultValue = 50;
    element.min = 0;
    element.max = 100;
    element.step = 1;

    return element;
  },

  onPropertyChange: function(element, name, value) {
    switch (name) {
      case 'defaultValue':
        element.defaultValue = value;
        break;
      case 'sliderValue':
        element.value = value;
        break;
      case 'min':
        element.min = value;
        break;
      case 'max':
        element.max = value;
        break;
      case 'step':
        element.step = value;
        break;
      default:
        return false;
    }
    return true;
  },

  readProperty: function(element, name) {
    switch (name) {
      case 'defaultValue':
        return element.defaultValue;
      case 'sliderValue':
        return parseInt(element.value, 10);
      case 'min':
        return element.min;
      case 'max':
        return element.max;
      case 'step':
        return element.step;
      default:
        throw `unknown property name ${name}`;
    }
  }
};
