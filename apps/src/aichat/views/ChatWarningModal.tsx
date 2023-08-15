import React from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';
import moduleStyles from './chatWarningModal.module.scss';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';

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
    <BodyTwoText>{aichatI18n.inappropriateMessageLimit()}</BodyTwoText>
    <br />
    <BodyTwoText>{aichatI18n.anythingPersonalCanNotBeSubmitted()}</BodyTwoText>
    <a href="#">{aichatI18n.whatIsPersonalInformation()}</a>
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
