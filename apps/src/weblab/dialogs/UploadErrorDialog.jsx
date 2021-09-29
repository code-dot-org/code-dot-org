import React from 'react';
import PropTypes from 'prop-types';
import commonI18n from '@cdo/locale';
import weblabI18n from '@cdo/weblab/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import {reload} from '@cdo/apps/utils';

export default function UploadErrorDialog({isOpen, handleClose, ...props}) {
  return (
    <StylizedBaseDialog
      {...props}
      isOpen={isOpen}
      handleConfirmation={handleClose}
      handleClose={handleClose}
      title={weblabI18n.uploadError()}
      body={weblabI18n.errorSavingProject()}
      cancellationButtonText={commonI18n.reloadPage()}
      handleCancellation={reload}
    />
  );
}

UploadErrorDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};
