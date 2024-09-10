import PropTypes from 'prop-types';
import React from 'react';

import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import i18n from '@cdo/weblab/locale';

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
  handleClose: PropTypes.func.isRequired,
};
