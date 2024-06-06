import Typography from '@cdo/apps/componentLibrary/typography';
import React from 'react';
import {BaseDialogProps} from './DialogManager';
import moduleStyles from './confirm-dialog.module.scss';
import commonI18n from '@cdo/locale';

/**
 * Generic confirmation dialog used in Lab2 labs.
 */
const GenericConfirmationDialog: React.FunctionComponent<BaseDialogProps> = ({
  handleConfirm,
  handleCancel,
  title,
  message,
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
          {commonI18n.delete()}
        </button>
      </div>
    </div>
  );
};

export default GenericConfirmationDialog;
