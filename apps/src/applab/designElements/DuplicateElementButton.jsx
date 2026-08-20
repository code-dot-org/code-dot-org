import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import commonMsg from '@cdo/locale';

/**
 * A duplicate button that helps replicate elements
 */
class DuplicateElementButton extends React.Component {
  static propTypes = {
    handleDuplicate: PropTypes.func.isRequired,
  };

  handleDuplicate = event => this.props.handleDuplicate();

  render() {
    return (
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        onClick={this.handleDuplicate}
      >
        {commonMsg.duplicate()}
      </MuiButton>
    );
  }
}

export default DuplicateElementButton;
