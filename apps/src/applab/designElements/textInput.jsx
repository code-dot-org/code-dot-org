import $ from 'jquery';
import React, {PropTypes} from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import EnumPropertyRow from './EnumPropertyRow';
import * as elementUtils from './elementUtils';

class TextInputProperties extends React.Component {
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
          desc={'placeholder'}
          initialValue={element.getAttribute('placeholder') || ''}
          handleChange={this.props.handleChange.bind(this, 'placeholder')}
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
        <ColorPickerPropertyRow
          desc={'text color'}
          initialValue={elementUtils.rgb2hex(element.style.color)}
          handleChange={this.props.handleChange.bind(this, 'textColor')}
        />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')}
        />
        <PropertyRow
          desc={'font size (px)'}
          isNumber={true}
          initialValue={parseInt(element.style.fontSize, 10)}
          handleChange={this.props.handleChange.bind(this, 'fontSize')}
        />
        <EnumPropertyRow
          desc={'text alignment'}
          initialValue={element.style.textAlign || 'left'}
          options={['left','right','center','justify']}
          handleChange={this.props.handleChange.bind(this, 'textAlign')}
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
      </div>);
  }
}

class TextInputEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getChangeEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("' + id + ' entered text: " + getText("' + id + '"));\n' +
      '});\n';
    return code;
  }

  insertChange = () => {
    this.props.onInsertEvent(this.getChangeEventCode());
  };

  getInputEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' + id + '", "input", function(event) {\n' +
      '  console.log("' + id + ' current text: " + getText("' + id + '"));\n' +
      '});\n';
    return code;
  }

  insertInput = () => {
    this.props.onInsertEvent(this.getInputEventCode());
  };

  render() {
    const element = this.props.element;

    const changeName = 'Change';
    const changeDesc = 'Triggered when the text input loses focus if the text has changed.';

    const inputName = 'Input';
    const inputDesc = 'Triggered immediately every time the text input contents change.';

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
          name={changeName}
          desc={changeDesc}
          handleInsert={this.insertChange}
        />
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
  PropertyTab: TextInputProperties,
  EventTab: TextInputEvents,

  create: function () {
    const element = document.createElement('input');
    element.style.margin = '0px';
    element.style.width = '200px';
    element.style.height = '30px';
    element.style.color = '#000000';
    element.style.backgroundColor = '';

    return element;
  },

  onDeserialize: function (element) {
    $(element).on('mousedown', function (e) {
      if (!Applab.isRunning()) {
        // Disable clicking into text input unless running
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

  onPropertyChange: function (element, name, value) {
    switch (name) {
      case 'value':
        element.value = value;
        break;
      case 'text':
        element.value = value;
        break;
      default:
        return false;
    }
    return true;
  },

  readProperty: function (element, name) {
    switch (name) {
      case 'value':
        return element.value;
      default:
        throw `unknown property name ${name}`;
    }
  }
};
