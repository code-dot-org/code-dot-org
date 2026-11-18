import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import React from 'react';
import {createPortal} from 'react-dom';

import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import moduleStyles from './FlaggedImageModal.module.scss';

const SIGNED_OUT_TITLE = 'Image Not Allowed';
const SIGNED_OUT_MESSAGE =
  'This image was flagged as inappropriate by our content moderation. Please choose a different image.';
const SIGNED_OUT_BUTTON_TEXT = 'OK';

interface FlaggedImageModalProps {
  appName: string;
  onAccept: (appName: string) => void | Promise<void>;
  onCancel: (appName: string) => void;
  errorMessage?: string;
}

const FlaggedImageModal: React.FC<FlaggedImageModalProps> = ({
  onAccept,
  onCancel,
  errorMessage,
  appName,
}) => {
  const isSignedOut = useAppSelector(
    state => state.currentUser.signInState === SignInState.SignedOut
  );

  const acceptanceTerms = (
    <div id="dsco-dialog-description">
      <Typography variant="body2" gutterBottom>
        {i18n.animationPicker_flaggedImage()}
      </Typography>
      <ul>
        <li>
          <Typography variant="body2" gutterBottom>
            {i18n.animationPicker_flaggedImageNoShare()}
          </Typography>
        </li>
        <li>
          <Typography variant="body2" gutterBottom>
            {i18n.animationPicker_flaggedImageNoUpload()}
          </Typography>
        </li>
        <li>
          <Typography variant="body2" gutterBottom>
            {i18n.animationPicker_flaggedImageTOS()}
          </Typography>
        </li>
      </ul>
      {errorMessage && (
        <Typography style={{color: 'red'}} variant="body2" gutterBottom>
          {errorMessage}
        </Typography>
      )}
    </div>
  );

  // Portal to document.body: when nested under another dialog, CustomDialog's
  // height:100% overlay collapses the Modal flex body. z-index keeps this modal on top.
  return createPortal(
    <div className={moduleStyles.stackingWrapper}>
      <Modal
        id="image-flagged-modal"
        onClose={() => onCancel(appName)}
        title={
          isSignedOut
            ? SIGNED_OUT_TITLE
            : i18n.animationPicker_flaggedImageModalTitle()
        }
        description={isSignedOut ? SIGNED_OUT_MESSAGE : undefined}
        customContent={isSignedOut ? undefined : acceptanceTerms}
        primaryButtonProps={
          isSignedOut
            ? {
                children: SIGNED_OUT_BUTTON_TEXT,
                onClick: () => onCancel(appName),
              }
            : {
                children: i18n.accept(),
                onClick: () => onAccept(appName),
                disabled: !!errorMessage, // Disable if there's an error message.
              }
        }
        secondaryButtonProps={
          isSignedOut
            ? undefined
            : {
                children: i18n.cancel(),
                onClick: () => onCancel(appName),
              }
        }
      />
    </div>,
    document.body
  );
};

export default FlaggedImageModal;
