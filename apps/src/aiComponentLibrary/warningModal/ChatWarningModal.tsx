import Button, {buttonColors} from '@code-dot-org/component-library/button';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@code-dot-org/component-library/typography';
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
      <Heading3>{i18n.aiWarningModalHeader()}</Heading3>
    </div>
    <hr />
    <div className={moduleStyles.warningModuleTextContainer}>
      <BodyTwoText>
        <StrongText>{i18n.aiWarningModalMessagesAreRecorded()}</StrongText>
      </BodyTwoText>
      <BodyTwoText>{i18n.aiWarningModalInappropriateFlagged()}</BodyTwoText>
      <BodyTwoText>{i18n.aiWarningUnsaved()}</BodyTwoText>
      <BodyTwoText>{i18n.aiWarningModalPersonalNotSubmitted()}</BodyTwoText>
    </div>
    <hr />
    <div className={moduleStyles.bottomSection}>
      <Button
        onClick={onClose}
        color={buttonColors.purple}
        text={i18n.aiWarningModalOk()}
      />
    </div>
  </AccessibleDialog>
);
export default ChatWarningModal;
