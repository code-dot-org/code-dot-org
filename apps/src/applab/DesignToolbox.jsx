import PropTypes from 'prop-types';
import React from 'react';
import DesignToolboxElement from './DesignToolboxElement';
import applabMsg from '@cdo/applab/locale';
import ThemeDropdown from './designElements/ThemeDropdown';

const IMAGE_BASE_URL = '/blockly/media/applab/design_toolbox/';

export default class DesignToolbox extends React.Component {
  static propTypes = {
    handleDragStart: PropTypes.func.isRequired,
    isToolboxVisible: PropTypes.bool.isRequired,
    handleScreenChange: PropTypes.func.isRequired,
    themeValue: PropTypes.string.isRequired
  };

  render() {
    const toolboxStyle = {
      display: this.props.isToolboxVisible ? 'block' : 'none',
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 270,
      boxSizing: 'border-box',
      borderRight: '1px solid gray',
      overflowY: 'auto',
      padding: 10,
      paddingRight: 0 // setting this to 0 allows 2 columns with the potential scrollbar on Windows
    };

    return (
      <div id="design-toolbox" style={toolboxStyle}>
        {/* key on theme dropdown forces re-render if we get a new themeValue */}
        <ThemeDropdown
          initialValue={this.props.themeValue}
          handleChange={this.props.handleScreenChange.bind(this, 'theme')}
          description={'Theme'}
          key={this.props.themeValue}
        />
        <p>{applabMsg.designToolboxDescription()}</p>
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'button.png'}
          desc={'Button'}
          elementType={'BUTTON'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'input.png'}
          desc={'Text Input'}
          elementType={'TEXT_INPUT'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'label.png'}
          desc={'Label'}
          elementType={'LABEL'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'dropdown.png'}
          desc={'Dropdown'}
          elementType={'DROPDOWN'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'radio.png'}
          desc={'Radio Button'}
          elementType={'RADIO_BUTTON'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'checkbox.png'}
          desc={'Checkbox'}
          elementType={'CHECKBOX'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'image.png'}
          desc={'Image'}
          elementType={'IMAGE'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'canvas.png'}
          desc={'Canvas'}
          elementType={'CANVAS'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'screen.png'}
          desc={'Screen'}
          elementType={'SCREEN'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'textarea.png'}
          desc={'Text Area'}
          elementType={'TEXT_AREA'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'chart.png'}
          desc={'Chart'}
          elementType={'CHART'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'slider.png'}
          desc={'Slider'}
          elementType={'SLIDER'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'camera.png'}
          desc={'Photo Select'}
          elementType={'PHOTO_SELECT'}
          handleDragStart={this.props.handleDragStart}
        />
      </div>
    );
  }
}
