import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

export default class SkipButton extends React.Component {
  static propTypes = {
    nextLevelUrl: PropTypes.string.isRequired,
  };

  render() {
    return (
      <MuiButton
        id="skipButton"
        variant="outlined"
        color="secondary"
        size="medium"
      >
        {msg.skipPuzzle()}
      </MuiButton>
    );
  }
}
