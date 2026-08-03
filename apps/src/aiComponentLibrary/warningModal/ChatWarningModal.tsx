import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import moduleStyles from './warning-modal.module.scss';

/**
 * Renders a modal that warns the user to chat responsibly with AI.
 */

export interface ChatWarningModalProps {
  onClose: () => void;
}

const ChatWarningModal: React.FunctionComponent<ChatWarningModalProps> = ({
  onClose,
}) => (
  <Modal
    className={moduleStyles.chatWarningModal}
    title={i18n.aiWarningModalHeader()}
    onClose={onClose}
    closeLabel={i18n.closeDialog()}
    customContent={
      <div id="dsco-dialog-description" className={moduleStyles.warningContent}>
        <Typography variant="body2" gutterBottom>
          <strong>{i18n.aiWarningModalMessagesAreRecorded()}</strong>
        </Typography>
        <Typography variant="body2" gutterBottom>
          {i18n.aiWarningModalInappropriateFlagged()}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {i18n.aiWarningUnsaved()}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {i18n.aiWarningModalPersonalNotSubmitted()}
        </Typography>
      </div>
    }
    primaryButtonProps={{
      children: i18n.aiWarningModalOk(),
      onClick: onClose,
    }}
  />
);

export default ChatWarningModal;
