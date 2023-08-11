import React from 'react';
import moduleStyles from './chatWarningModal.module.scss';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import aichatI18n from '@cdo/apps/aichat/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';

interface ChatWarningModalProps {
  onClose: () => void;
}

const ChatWarningModal: React.FunctionComponent<ChatWarningModalProps> = ({
  onClose,
}) => (
  <AccessibleDialog onClose={onClose}>
    <Heading3>{aichatI18n.warningModalHeader()}</Heading3>
    <hr />
    <BodyTwoText>
      <StrongText>{aichatI18n.allMessagesSentAreRecorded()}</StrongText>
    </BodyTwoText>
    <BodyTwoText>{aichatI18n.inappropriateMessagesAreFlagged()}</BodyTwoText>
    <BodyTwoText>{aichatI18n.anythingPersonalCanNotBeSubmitted()}</BodyTwoText>
    <a href="#">{aichatI18n.whatIsPersonalInformation()}</a>
    <hr />
    <div>
      <Button
        onClick={onClose}
        color={Button.ButtonColor.brandSecondaryDefault}
        text={aichatI18n.warningModalOkButtonText()}
      />
    </div>
  </AccessibleDialog>
);
export default ChatWarningModal;
