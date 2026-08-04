import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import * as elementUtils from './elementUtils';

export default class DefaultScreenButtonPropertyRow extends React.Component {
  static propTypes = {
    handleChange: PropTypes.func.isRequired,
    screenId: PropTypes.string,
  };

  handleMakeDefault = event => this.props.handleChange(true);

  render() {
    if (
      elementUtils.getId(elementUtils.getScreens()[0]) === this.props.screenId
    ) {
      return false;
    }

    return (
      <div style={{marginLeft: 20}}>
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          onClick={this.handleMakeDefault}
        >
          {applabMsg.designWorkspace_makeDefaultButton()}
        </MuiButton>
      </div>
    );
  }
}
