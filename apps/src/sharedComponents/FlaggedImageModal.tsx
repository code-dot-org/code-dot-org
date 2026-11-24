import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import React from 'react';
import {createPortal} from 'react-dom';

import {getStore} from '@cdo/apps/redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

import moduleStyles from './FlaggedImageModal.module.scss';

interface FlaggedImageModalProps {
  appName: string;
  onAccept: (appName: string) => void | Promise<void>;
  onCancel: (appName: string, isSignedOut: boolean) => void;
  errorMessage?: string;
}

const FlaggedImageModal: React.FC<FlaggedImageModalProps> = ({
  onAccept,
  onCancel,
  errorMessage,
  appName,
}) => {
  // Flagging a project requires sign-in, so signed-out user's project can't be flagged.
  // The store is read directly because this component may be mounted without a redux provider.
  const isSignedOut =
    getStore().getState().currentUser?.signInState !== SignInState.SignedIn;

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
        onClose={() => onCancel(appName, isSignedOut)}
        title={
          isSignedOut
            ? 'Error: Inappropriate Image'
            : i18n.animationPicker_flaggedImageModalTitle()
        }
        description={
          isSignedOut
            ? 'This image has been flagged as inappropriate. Please choose a different image.'
            : undefined
        }
        customContent={isSignedOut ? undefined : acceptanceTerms}
        primaryButtonProps={
          isSignedOut
            ? {
                children: 'OK',
                onClick: () => onCancel(appName, isSignedOut),
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
                onClick: () => onCancel(appName, isSignedOut),
              }
        }
      />
    </div>,
    document.body
  );
};

export default FlaggedImageModal;
