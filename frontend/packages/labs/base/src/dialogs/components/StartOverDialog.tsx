import type {FunctionComponent} from 'react';

import type {AppName} from '@code-dot-org/projects';

import {TEXT_BASED_LABS} from '../../constants';
import {useApp} from '../../contexts/AppContext';

import GenericDialog, {type GenericDialogProps} from './GenericDialog';

/**
 * Lab-specific messages for starting over.
 */
const LAB_SPECIFIC_MESSAGES: {[appName in AppName]?: string} = {
  aichat:
    'This will reset this level to its start state and remove any model customizations or model card information you’ve added or changed.',
};

export type StartOverDialogProps = GenericDialogProps & {
  /** Callback when confirm is pressed. */
  onConfirm: () => void;
  /** Callback when cancel is pressed. */
  onCancel?: () => void;
};

/**
 * Start Over dialog used in Lab2 labs.
 */
const StartOverDialog: FunctionComponent<StartOverDialogProps> = ({
  onConfirm,
  onCancel = () => {},
}) => {
  const currentAppName = useApp().lab?.levelProperties.appName;

  const isTextWorkspace =
    currentAppName && TEXT_BASED_LABS.includes(currentAppName);

  const dialogMessage =
    (currentAppName && LAB_SPECIFIC_MESSAGES[currentAppName]) ||
    (isTextWorkspace
      ? "This will reset the workspace to its start state and remove all the code you've added or changed."
      : "This will reset the workspace to its start state and remove all the blocks you've added or changed.");

  return (
    <GenericDialog
      title="Are you sure you want to start over?"
      message={dialogMessage}
      buttons={{
        confirm: {
          callback: onConfirm,
          text: 'Start Over',
        },
        cancel: {
          callback: onCancel,
        },
      }}
    />
  );
};

export default StartOverDialog;
