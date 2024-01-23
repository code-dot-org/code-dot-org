import React, {useState} from 'react';
import style from '@cdo/apps/aichat/views/chatWarningModal.module.scss';
import {
  BodyTwoText,
  Heading2,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';

const WarningModal = () => {
  const [open, setOpen] = useState(true);
  console.log(open);

  const onClose = () => {
    setOpen(false);
  };
  return (
    open && (
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
          information (name, phone number, address, etc.) should not be
          submitted to AI Tutor.
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
    )
  );
};

export default WarningModal;
