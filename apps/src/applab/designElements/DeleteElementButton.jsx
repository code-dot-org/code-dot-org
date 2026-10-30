import {
  Box,
  Button as MuiButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import commonMsg from '@cdo/locale';

/**
 * A delete button that will also ask for confirmation when shouldConfirm is
 * true.
 */
class DeleteElementButton extends React.Component {
  static propTypes = {
    shouldConfirm: PropTypes.bool.isRequired,
    handleDelete: PropTypes.func.isRequired,
  };

  state = {
    confirming: false,
  };

  handleDeleteInternal = event => {
    if (this.props.shouldConfirm) {
      this.setState({confirming: true});
    } else {
      this.finishDelete();
    }
  };

  finishDelete = () => this.props.handleDelete();

  abortDelete = event => this.setState({confirming: false});

  render() {
    if (this.state.confirming) {
      return (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <MuiTypography variant="body4">
            {commonMsg.deleteConfirm()}
          </MuiTypography>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            sx={{
              background: 'var(--background-error-primary)',
              '&:hover': {
                background: 'var(--background-error-strong)',
              },
            }}
            onClick={this.finishDelete}
          >
            {commonMsg.yes()}
          </MuiButton>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={this.abortDelete}
          >
            {commonMsg.no()}
          </MuiButton>
        </Box>
      );
    }
    return (
      <MuiButton
        type="button"
        variant="contained"
        color="primary"
        size="small"
        sx={{
          background: 'var(--background-error-primary)',
          '&:hover': {
            background: 'var(--background-error-strong)',
          },
        }}
        onClick={this.handleDeleteInternal}
      >
        {commonMsg.delete()}
      </MuiButton>
    );
  }
}

export default DeleteElementButton;
