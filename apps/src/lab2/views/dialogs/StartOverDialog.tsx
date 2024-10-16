import React from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {TEXT_BASED_LABS} from '../../constants';
import {AppName} from '../../types';

import GenericDialog, {GenericDialogProps} from './GenericDialog';

// Lab-specific messages for starting over.
const LAB_SPECIFIC_MESSAGES: {[appName in AppName]?: string} = {
  aichat: aichatI18n.startOverAichatModelCustomizations(),
};

/**
 * Start Over dialog used in Lab2 labs.
 */

export type StartOverDialogProps = GenericDialogProps & {
  handleConfirm: () => void;
  handleCancel?: () => void;
};

const StartOverDialog: React.FunctionComponent<StartOverDialogProps> = ({
  handleConfirm,
  handleCancel = () => {},
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
    <GenericDialog
      title={commonI18n.startOverTitle()}
      message={dialogMessage}
      buttons={{
        confirm: {
          callback: handleConfirm,
          text: commonI18n.startOver(),
        },
        cancel: {
          callback: handleCancel,
        },
      }}
    />
  );
};

export default StartOverDialog;
