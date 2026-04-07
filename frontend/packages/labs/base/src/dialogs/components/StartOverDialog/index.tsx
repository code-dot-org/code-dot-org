import Dialog from '@code-dot-org/component-library/dialog';

import type {ProjectType} from '@code-dot-org/core/api';

import {TEXT_BASED_LABS} from '../../../constants';
import {useApp} from '../../../contexts/AppContext';

import moduleStyles from './startOverDialog.module.scss';

/**
 * Lab-specific messages for starting over.
 */
const LAB_SPECIFIC_MESSAGES: {[appName in ProjectType]?: string} = {
  aichat:
    'This will reset this level to its start state and remove any model customizations or model card information you’ve added or changed.',
};

export interface StartOverDialogProps {
  /** Callback when confirm is pressed. */
  onConfirm: () => void;
  /** Callback when cancel is pressed. */
  onCancel?: () => void;
  /** Potentially the message to override inside the dialog */
  message?: string;
}

/**
 * Start Over dialog used in Lab2 labs.
 */
const StartOverDialog = ({
  onConfirm,
  onCancel = () => {},
  message,
}: StartOverDialogProps) => {
  const currentAppName = useApp().lab?.levelProperties.appName;

  const isTextWorkspace =
    currentAppName && TEXT_BASED_LABS.includes(currentAppName);

  const dialogMessage =
    (currentAppName && LAB_SPECIFIC_MESSAGES[currentAppName]) ||
    (isTextWorkspace
      ? "This will reset the workspace to its start state and remove all the code you've added or changed."
      : "This will reset the workspace to its start state and remove all the blocks you've added or changed.");

  return (
    <Dialog
      className={moduleStyles.startOverDialog}
      title="Are you sure you want to start over?"
      description={message || dialogMessage}
      closeLabel="Cancel Start Over"
      icon={{
        iconName: 'rotate-left',
        iconStyle: 'solid',
      }}
      primaryButtonProps={{
        text: 'Start Over',
        onClick: onConfirm,
      }}
      secondaryButtonProps={{
        text: 'Cancel',
        onClick: onCancel,
      }}
    />
  );
};

export default StartOverDialog;
