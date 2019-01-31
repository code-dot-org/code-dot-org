import $ from 'jquery';
import React, {PropTypes} from 'react';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import OptionsSelectRow from './OptionsSelectRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import color from "../../util/color";
import EnumPropertyRow from './EnumPropertyRow';
import * as elementUtils from './elementUtils';

class DropdownProperties extends React.Component {
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
        <OptionsSelectRow
          desc={'options'}
          element={element}
          handleChange={this.props.handleChange.bind(this, 'options')}
        />
        <PropertyRow
          desc={'index'}
          isNumber={true}
          initialValue={parseInt(element.selectedIndex, 10)}
          handleChange={this.props.handleChange.bind(this, 'index')}
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
          initialValue={element.style.textAlign || 'center'}
          options={['left','right','center','justify']}
          handleChange={this.props.handleChange.bind(this, 'textAlign')}
        />
        <PropertyRow
          desc={'border width (px)'}
          isNumber
          initialValue={parseInt(element.style.borderWidth, 10)}
          handleChange={this.props.handleChange.bind(this, 'borderWidth')}
        />
        <ColorPickerPropertyRow
          desc={'border color'}
          initialValue={elementUtils.rgb2hex(element.style.borderColor)}
          handleChange={this.props.handleChange.bind(this, 'borderColor')}
        />
        <PropertyRow
          desc={'border radius (px)'}
          isNumber
          initialValue={parseInt(element.style.borderRadius, 10)}
          handleChange={this.props.handleChange.bind(this, 'borderRadius')}
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

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
}

class DropdownEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired
  };

  getChangeEventCode() {
    const id = elementUtils.getId(this.props.element);
    const code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("Selected option: " + getText("' + id + '"));\n' +
      '});\n';
    return code;
  }

  insertChange = () => {
    this.props.onInsertEvent(this.getChangeEventCode());
  };

  render() {
    const element = this.props.element;
    const changeName = 'Change';
    const changeDesc = 'Triggered every time an option is selected from the dropdown.';

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
      </div>
    );
  }
}

export default {
  PropertyTab: DropdownProperties,
  EventTab: DropdownEvents,

  create: function () {
    const element = document.createElement('select');
    element.style.width = '200px';
    element.style.height = '30px';
    element.style.fontSize = '14px';
    element.style.margin = '0';
    element.style.color = color.white;
    element.style.backgroundColor = color.applab_button_teal;
    elementUtils.setDefaultBorderStyles(element, { forceDefaultBorderColor: true });

    const option1 = document.createElement('option');
    option1.innerHTML = 'Option 1';
    element.appendChild(option1);

    const option2 = document.createElement('option');
    option2.innerHTML = 'Option 2';
    element.appendChild(option2);

    return element;
  },

  onDeserialize: function (element) {
    // Set border styles for older projects that didn't set them on create:
    elementUtils.setDefaultBorderStyles(element);

    // In the future we may want to trigger this on focus events as well.
    $(element).on('mousedown', function (e) {
      if (!Applab.isRunning()) {
        // Disable dropdown menu unless running
        e.preventDefault();
        this.blur();
        window.focus();
      }
    });
  },

  onPropertyChange: function (element, name, value) {
    switch (name) {
      case 'value':
        element.value = value;
        break;
      case 'text':
        // Overrides generic text setter and sets from the dropdown options
        element.value = value;
        break;
      case 'index':
        element.selectedIndex = value;
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
      case 'index':
        return element.selectedIndex;
      default:
        throw `unknown property name ${name}`;
    }
  }
};
