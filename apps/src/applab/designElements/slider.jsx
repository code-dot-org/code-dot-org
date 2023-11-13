import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import applabMsg from '@cdo/applab/locale';
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
    onDepthChange: PropTypes.func.isRequired,
  };

  render() {
    const element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_widthPx()}
          isNumber={true}
          initialValue={parseInt(element.style.width, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-width')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_heightPx()}
          isNumber={true}
          initialValue={parseInt(element.style.height, 10)}
          handleChange={this.props.handleChange.bind(this, 'style-height')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_xPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_yPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_value()}
          isNumber={true}
          initialValue={element.defaultValue}
          handleChange={this.props.handleChange.bind(this, 'defaultValue')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_minimumValue()}
          isNumber={true}
          initialValue={parseInt(element.min, 10)}
          handleChange={this.props.handleChange.bind(this, 'min')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_maximumValue()}
          isNumber={true}
          initialValue={parseInt(element.max, 10)}
          handleChange={this.props.handleChange.bind(this, 'max')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_stepSize()}
          isNumber={true}
          initialValue={parseInt(element.step, 10)}
          handleChange={this.props.handleChange.bind(this, 'step')}
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

class SliderEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
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
          name={applabMsg.designElementEvent_input()}
          desc={applabMsg.designElement_slider_inputEventDesc()}
          handleInsert={this.insertInput}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: SliderProperties,
  EventTab: SliderEvents,

  create: function () {
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

  onPropertyChange: function (element, name, value) {
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

  readProperty: function (element, name) {
    switch (name) {
      case 'defaultValue':
        return element.defaultValue;
      case 'sliderValue':
        return parseInt(element.value, 10);
      case 'min':
        return parseInt(element.min, 10);
      case 'max':
        return parseInt(element.max, 10);
      case 'step':
        return parseInt(element.step, 10);
      default:
        throw `unknown property name ${name}`;
    }
  },
};
