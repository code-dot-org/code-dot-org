import React from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';
import Typography from '@cdo/apps/componentLibrary/typography';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {TEXT_BASED_LABS} from '../../constants';
import {AppName} from '../../types';

import {BaseDialogProps} from './DialogManager';

import moduleStyles from './confirm-dialog.module.scss';

// Lab-specific messages for starting over.
const LAB_SPECIFIC_MESSAGES: {[appName in AppName]?: string} = {
  aichat: aichatI18n.startOverAichatModelCustomizations(),
};

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

  const isTextWorkspace =
    currentAppName && TEXT_BASED_LABS.includes(currentAppName);

  const dialogMessage =
    (currentAppName && LAB_SPECIFIC_MESSAGES[currentAppName]) ||
    (isTextWorkspace
      ? commonI18n.startOverWorkspaceText()
      : commonI18n.startOverWorkspace());

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
