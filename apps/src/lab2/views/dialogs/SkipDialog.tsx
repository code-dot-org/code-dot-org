import React from 'react';

import Typography from '@cdo/apps/componentLibrary/typography';

import {BaseDialogProps} from './DialogManager';

import moduleStyles from './confirm-dialog.module.scss';

const commonI18n = require('@cdo/locale');

/**
 * Skip dialog used in Lab2 labs.
 */
const SkipDialog: React.FunctionComponent<BaseDialogProps> = ({
  handleConfirm,
  handleCancel,
}) => {
  return (
    <div className={moduleStyles.confirmDialog}>
      <Typography semanticTag="h1" visualAppearance="heading-lg">
        {commonI18n.skipTitle()}
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-two">
        {commonI18n.skipBody()}
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
          {commonI18n.skipToProject()}
        </button>
      </div>
    </div>
  );
};

export default SkipDialog;
