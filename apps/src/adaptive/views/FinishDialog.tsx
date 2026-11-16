// Asked before leaving the pathway for good, with the pathway's own words:
// the student may keep working, or finish. The same modal as the Hour of AI
// congratulations dialog.

import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

import {FinishDialogContent} from '../types';

interface FinishDialogProps {
  dialog: FinishDialogContent;
  onKeepWorking: () => void;
  onFinish: () => void;
}

const FinishDialog: React.FunctionComponent<FinishDialogProps> = ({
  dialog,
  onKeepWorking,
  onFinish,
}) => (
  <Modal
    title={dialog.title}
    description={dialog.body}
    onClose={onKeepWorking}
    primaryButtonProps={{
      children: dialog.finishLabel ?? 'Finish',
      size: 'small',
      onClick: onFinish,
    }}
    secondaryButtonProps={{
      children: dialog.cancelLabel ?? 'Keep Working',
      size: 'small',
      color: 'tertiary',
      variant: 'outlined',
      onClick: onKeepWorking,
    }}
  />
);

export default FinishDialog;
