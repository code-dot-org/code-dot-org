import Typography from '@cdo/apps/componentLibrary/typography';
import React from 'react';
import {BaseDialogProps} from './DialogManager';
import moduleStyles from './start-over-dialog.module.scss';
const commonI18n = require('@cdo/locale');

/**
 * Start Over dialog used in Lab2 labs.
 */
const StartOverDialog: React.FunctionComponent<BaseDialogProps> = ({
  handleConfirm,
  handleCancel,
}) => {
  return (
    <div className={moduleStyles.startOverDialog}>
      <Typography semanticTag="h1" visualAppearance="heading-lg">
        {commonI18n.startOverTitle()}
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-two">
        {commonI18n.startOverWorkspace()}
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
          className={moduleStyles.startOver}
          type="button"
          onClick={handleConfirm}
        >
          {commonI18n.startOver()}
        </button>
      </div>
    </div>
  );
};

export default StartOverDialog;
