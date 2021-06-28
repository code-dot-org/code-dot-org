import React from 'react';
import PropTypes from 'prop-types';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';

// TODO: i18n
export default function ResetSuccessDialog(props) {
  return (
    <StylizedBaseDialog
      isOpen={props.isOpen}
      handleClose={props.handleClose}
      title="Web Lab Reset Complete"
      body="Reloading..."
      hideFooter
    />
  );
}

ResetSuccessDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};
