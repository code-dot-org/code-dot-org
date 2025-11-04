import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

interface FlaggedImageModalProps {
  onAccept: () => void;
  onCancel: () => void;
  errorMessage?: string;
}

const FlaggedImageModal: React.FC<FlaggedImageModalProps> = ({
  onAccept,
  onCancel,
  errorMessage,
}) => {
  return (
    <Modal
      id="image-flagged-modal"
      onClose={onCancel}
      title={i18n.animationPicker_flaggedImageModalTitle()}
      customContent={
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
      }
      primaryButtonProps={{
        text: i18n.accept(),
        onClick: onAccept,
        disabled: !!errorMessage, // Disable if there's an error message.
      }}
      secondaryButtonProps={{
        text: i18n.cancel(),
        onClick: onCancel,
      }}
    />
  );
};

export default FlaggedImageModal;
