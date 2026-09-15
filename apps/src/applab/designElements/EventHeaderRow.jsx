import {Typography as MuiTypography} from '@mui/material';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import * as rowStyle from './rowStyle';

export default class EventHeaderRow extends React.Component {
  render() {
    return (
      <MuiTypography style={rowStyle.container} variant="body4">
        {applabMsg.addEventHeader()}
      </MuiTypography>
    );
  }
}
