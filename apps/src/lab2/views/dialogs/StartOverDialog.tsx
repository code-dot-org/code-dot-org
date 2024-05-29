import Typography from '@cdo/apps/componentLibrary/typography';
import React from 'react';
import {BaseDialogProps} from './DialogManager';
import moduleStyles from './confirm-dialog.module.scss';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {TEXT_BASED_LABS, AppName} from '@cdo/apps/lab2/types';
const commonI18n = require('@cdo/locale');

/**
 * Start Over dialog used in Lab2 labs.
 */
const StartOverDialog: React.FunctionComponent<BaseDialogProps> = ({
  handleConfirm,
  handleCancel,
}) => {
  const currentAppName = useAppSelector(
    state => state.lab.levelProperties?.appName
  );

  const generaDialogMessage =
    currentAppName && TEXT_BASED_LABS.includes(currentAppName)
      ? commonI18n.startOverWorkspaceText()
      : commonI18n.startOverWorkspace();

  // Lab-specific messages for starting over.
  const LAB_SPECIFIC_MESSAGES: Partial<Record<AppName, string>> = {
    aichat: commonI18n.startOverAichatModelCustomizations(),
  };
  const appSpecificMessage =
    currentAppName && LAB_SPECIFIC_MESSAGES[currentAppName];
  const dialogMessage = appSpecificMessage || generaDialogMessage;

  return (
    <div className={moduleStyles.confirmDialog}>
      <Typography semanticTag="h1" visualAppearance="heading-lg">
        {commonI18n.startOverTitle()}
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-two">
        {dialogMessage}
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
          {commonI18n.startOver()}
        </button>
      </div>
    </div>
  );
};

export default StartOverDialog;
