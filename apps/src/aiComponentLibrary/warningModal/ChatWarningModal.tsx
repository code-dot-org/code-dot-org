import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
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
    <Heading3>{i18n.aiWarningModalHeader()}</Heading3>
    <hr />
    <BodyTwoText>
      <StrongText>{i18n.aiWarningModalMessagesAreRecorded()}</StrongText>
    </BodyTwoText>
    <BodyTwoText>{i18n.aiWarningModalInappropriateFlagged()}</BodyTwoText>
    <BodyTwoText>{i18n.aiWarningUnsaved()}</BodyTwoText>
    <BodyTwoText>{i18n.aiWarningModalPersonalNotSubmitted()}</BodyTwoText>
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
