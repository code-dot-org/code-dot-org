import PropTypes from 'prop-types';
import React from 'react';

import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import {reload} from '@cdo/apps/utils';
import commonI18n from '@cdo/locale';
import weblabI18n from '@cdo/weblab/locale';

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
  handleClose: PropTypes.func.isRequired,
};
