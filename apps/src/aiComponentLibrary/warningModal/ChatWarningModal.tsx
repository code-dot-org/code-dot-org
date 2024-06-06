import React from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';

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
    <Heading3>{aichatI18n.warningModalHeader()}</Heading3>

    <button
      type="button"
      onClick={onClose}
      className={moduleStyles.xCloseButton}
    >
      <i id="x-close" className="fa-solid fa-xmark" />
    </button>
    <hr />
    <BodyTwoText>
      <StrongText>{aichatI18n.allMessagesSentAreRecorded()}</StrongText>
    </BodyTwoText>
    <BodyTwoText>{aichatI18n.inappropriateMessagesAreFlagged()}</BodyTwoText>
    <br />
    <BodyTwoText>{aichatI18n.anythingPersonalCanNotBeSubmitted()}</BodyTwoText>
    <hr />
    <div className={moduleStyles.bottomSection}>
      <Button
        onClick={onClose}
        color={Button.ButtonColor.brandSecondaryDefault}
        text={aichatI18n.warningModalOkButtonText()}
      />
    </div>
  </AccessibleDialog>
);
export default ChatWarningModal;
