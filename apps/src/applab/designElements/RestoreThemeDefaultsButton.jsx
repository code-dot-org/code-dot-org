import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

/**
 * A restore theme defaults button
 */
class RestoreThemeDefaultsButton extends React.Component {
  static propTypes = {
    handleRestore: PropTypes.func.isRequired,
  };

  render() {
    const {handleRestore} = this.props;
    return (
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        onClick={handleRestore}
      >
        {applabMsg.designWorkspace_restoreThemeButton()}
      </MuiButton>
    );
  }
}

export default RestoreThemeDefaultsButton;
