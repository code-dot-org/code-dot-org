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
    themeValue: PropTypes.string.isRequired,
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
      paddingRight: 0, // setting this to 0 allows 2 columns with the potential scrollbar on Windows
    };

    return (
      <div id="design-toolbox" style={toolboxStyle}>
        {/* key on theme dropdown forces re-render if we get a new themeValue */}
        <ThemeDropdown
          initialValue={this.props.themeValue}
          handleChange={this.props.handleScreenChange.bind(this, 'theme')}
          description={applabMsg.designElementTheme()}
          key={this.props.themeValue}
        />
        <p>{applabMsg.designToolboxDescription()}</p>
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'button.png'}
          desc={applabMsg.designElement_button()}
          elementType={'BUTTON'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'input.png'}
          desc={applabMsg.designElement_textInput()}
          elementType={'TEXT_INPUT'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'label.png'}
          desc={applabMsg.designElement_label()}
          elementType={'LABEL'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'dropdown.png'}
          desc={applabMsg.designElement_dropdown()}
          elementType={'DROPDOWN'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'radio.png'}
          desc={applabMsg.designElement_radioButton()}
          elementType={'RADIO_BUTTON'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'checkbox.png'}
          desc={applabMsg.designElement_checkbox()}
          elementType={'CHECKBOX'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'image.png'}
          desc={applabMsg.designElement_image()}
          elementType={'IMAGE'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'canvas.png'}
          desc={applabMsg.designElement_canvas()}
          elementType={'CANVAS'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'screen.png'}
          desc={applabMsg.designElement_screen()}
          elementType={'SCREEN'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'textarea.png'}
          desc={applabMsg.designElement_textArea()}
          elementType={'TEXT_AREA'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'chart.png'}
          desc={applabMsg.designElement_chart()}
          elementType={'CHART'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'slider.png'}
          desc={applabMsg.designElement_slider()}
          elementType={'SLIDER'}
          handleDragStart={this.props.handleDragStart}
        />
        <DesignToolboxElement
          imageUrl={IMAGE_BASE_URL + 'camera.png'}
          desc={applabMsg.designElement_photoSelect()}
          elementType={'PHOTO_SELECT'}
          handleDragStart={this.props.handleDragStart}
        />
      </div>
    );
  }
}
