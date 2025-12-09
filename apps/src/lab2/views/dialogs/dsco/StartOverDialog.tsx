import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

export type MessageType = 'text' | 'blocks' | 'custom';

interface StartOverDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  type: MessageType;
  message?: string;
}

const StartOverDialog: React.FC<StartOverDialogProps> = ({
  onConfirm,
  onCancel,
  type,
  message,
}) => (
  <Modal
    title={commonI18n.startOverTitle()}
    description={
      type === 'text'
        ? commonI18n.startOverWorkspaceText()
        : type === 'blocks'
        ? commonI18n.startOverWorkspace()
        : message
    }
    primaryButtonProps={{text: commonI18n.startOver(), onClick: onConfirm}}
    secondaryButtonProps={{text: commonI18n.cancel(), onClick: onCancel}}
    onClose={onCancel}
  />
);

export default StartOverDialog;
