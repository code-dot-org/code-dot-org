import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/weblab/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';

export default function ResetSuccessDialog({isOpen, handleClose, ...props}) {
  return (
    <StylizedBaseDialog
      {...props}
      isOpen={isOpen}
      handleClose={handleClose}
      title={i18n.resetComplete()}
      body={i18n.reloading()}
      hideFooter
    />
  );
}

ResetSuccessDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};
