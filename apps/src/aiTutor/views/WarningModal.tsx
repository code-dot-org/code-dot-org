import React, {useEffect, useState} from 'react';
import style from './warning-modal.module.scss';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  BodyTwoText,
  Heading2,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

const WarningModal = () => {
  const sessionStorageKey = 'AITutorWarningModalSeenKey';
  const isChatOpen = useAppSelector(state => state.aiTutor.isChatOpen);

  const [hasSeenWarningModal, setHasSeenWarningModal] = useState(() => {
    // Check session storage to see if modal has been shown
    return JSON.parse(tryGetSessionStorage(sessionStorageKey, false)) || false;
  });

  useEffect(() => {
    if (!hasSeenWarningModal) {
      // As soon as the modal is considered to be shown, mark it as seen in session storage
      trySetSessionStorage(sessionStorageKey, 'true');
    }
  }, [hasSeenWarningModal]);

  const onClose = () => {
    setHasSeenWarningModal(true);
  };

  // If the user has already seen the warning modal or chat is not open, don't show it
  if (!isChatOpen || hasSeenWarningModal) {
    return null;
  }

  return (
    <AccessibleDialog onClose={onClose} className={style.chatWarningModal}>
      <Heading2>Remember to chat responsibly!</Heading2>

      <button type="button" onClick={onClose} className={style.xCloseButton}>
        <i id="x-close" className="fa-solid fa-xmark" />
      </button>
      <hr />
      <BodyTwoText>
        <StrongText>All messages sent to AI Tutor are recorded</StrongText>
      </BodyTwoText>
      <BodyTwoText>
        Inappropriate messages will be flagged and your teacher will be
        notified.
      </BodyTwoText>
      <br />
      <BodyTwoText>
        In order to protect your privacy, anything considered personal
        information (name, phone number, address, etc.) should not be submitted
        to AI Tutor.
      </BodyTwoText>
      <hr />
      <div className={style.bottomSection}>
        <Button
          onClick={onClose}
          color={Button.ButtonColor.brandSecondaryDefault}
          text="Ask AI Tutor"
        />
      </div>
    </AccessibleDialog>
  );
};

export default WarningModal;
