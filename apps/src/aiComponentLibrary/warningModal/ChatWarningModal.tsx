import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
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
  <AccessibleDialog onClose={onClose} className={moduleStyles.chatWarningModal}>
    <div className={moduleStyles.headerContainer}>
      <Typography variant="h3" gutterBottom>
        {i18n.aiWarningModalHeader()}
      </Typography>
    </div>
    <hr />
    <div className={moduleStyles.warningModuleTextContainer}>
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
    <hr />
    <div className={moduleStyles.bottomSection}>
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
        onClick={onClose}
        type="button"
      >
        {i18n.aiWarningModalOk()}
      </MuiButton>
    </div>
  </AccessibleDialog>
);
export default ChatWarningModal;
