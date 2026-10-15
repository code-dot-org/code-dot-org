import {
  Box,
  Button as MuiButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import * as rowStyle from './rowStyle';

export default class EventRow extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    handleInsert: PropTypes.func.isRequired,
  };

  render() {
    return (
      <Box
        style={{
          ...rowStyle.container,
          flexDirection: 'column',
          gap: '0.125rem',
          alignItems: 'start',
        }}
      >
        <MuiTypography variant="h6" component="h3">
          {this.props.name}
        </MuiTypography>
        <MuiTypography variant="body4">
          <em>{this.props.desc}</em>
        </MuiTypography>
        <MuiButton
          variant="outlined"
          color="secondary"
          onClick={this.props.handleInsert}
          size="extraSmall"
        >
          {applabMsg.designWorkspace_eventInsertButton()}
        </MuiButton>
      </Box>
    );
  }
}
