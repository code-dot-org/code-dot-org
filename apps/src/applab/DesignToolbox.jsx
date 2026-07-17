import {Box, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import ThemeDropdown from './designElements/ThemeDropdown';
import DesignToolboxElement from './DesignToolboxElement';

export default class DesignToolbox extends React.Component {
  static propTypes = {
    handleDragStart: PropTypes.func.isRequired,
    isToolboxVisible: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
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
      borderRight: this.props.isRtl ? '' : '1px solid gray',
      borderLeft: this.props.isRtl ? '1px solid gray' : '',
      overflowY: 'auto',
      padding: 10,
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
        <MuiTypography variant="body3">
          {applabMsg.designToolboxDescription()}
        </MuiTypography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'space-between',
            padding: 2,
          }}
        >
          <DesignToolboxElement
            icon="hand-pointer"
            desc={applabMsg.designElement_button()}
            elementType={'BUTTON'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="i-cursor"
            desc={applabMsg.designElement_textInput()}
            elementType={'TEXT_INPUT'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="font"
            desc={applabMsg.designElement_label()}
            elementType={'LABEL'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="square-caret-down"
            desc={applabMsg.designElement_dropdown()}
            elementType={'DROPDOWN'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="circle-dot"
            desc={applabMsg.designElement_radioButton()}
            elementType={'RADIO_BUTTON'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="square-check"
            desc={applabMsg.designElement_checkbox()}
            elementType={'CHECKBOX'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="image"
            desc={applabMsg.designElement_image()}
            elementType={'IMAGE'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="paintbrush"
            desc={applabMsg.designElement_canvas()}
            elementType={'CANVAS'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="mobile-screen"
            desc={applabMsg.designElement_screen()}
            elementType={'SCREEN'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="align-left"
            desc={applabMsg.designElement_textArea()}
            elementType={'TEXT_AREA'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="chart-column"
            desc={applabMsg.designElement_chart()}
            elementType={'CHART'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="sliders"
            desc={applabMsg.designElement_slider()}
            elementType={'SLIDER'}
            handleDragStart={this.props.handleDragStart}
          />
          <DesignToolboxElement
            icon="camera"
            desc={applabMsg.designElement_photoSelect()}
            elementType={'PHOTO_SELECT'}
            handleDragStart={this.props.handleDragStart}
          />
        </Box>
      </div>
    );
  }
}
