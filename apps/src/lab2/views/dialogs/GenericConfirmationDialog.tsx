import React from 'react';

import Typography from '@cdo/apps/componentLibrary/typography';
import commonI18n from '@cdo/locale';

import {BaseDialogProps} from './DialogManager';

import moduleStyles from './confirm-dialog.module.scss';

/**
 * Generic confirmation dialog used in Lab2 labs.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */
const GenericConfirmationDialog: React.FunctionComponent<BaseDialogProps> = ({
  handleConfirm,
  handleCancel,
  title,
  message,
  confirmText,
}) => {
  return (
    <div className={moduleStyles.confirmDialog}>
      <Typography semanticTag="h1" visualAppearance="heading-lg">
        {title}
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-two">
        {message}
      </Typography>
      <div className={moduleStyles.buttonContainer}>
        <button
          className={moduleStyles.cancel}
          type="button"
          onClick={handleCancel}
        >
          {commonI18n.cancel()}
        </button>
        <button
          className={moduleStyles.confirm}
          type="button"
          onClick={handleConfirm}
        >
          {confirmText || commonI18n.dialogOK()}
        </button>
      </div>
    </div>
  );
};

export default GenericConfirmationDialog;
