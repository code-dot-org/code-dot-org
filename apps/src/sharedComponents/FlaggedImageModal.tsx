import {useTheme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
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
  const {theme} = useTheme();

  return (
    <Modal
      id="image-flagged-modal"
      mode={theme === 'Dark' ? 'dark' : 'light'}
      onClose={onCancel}
      title={i18n.animationPicker_flaggedImageModalTitle()}
      customContent={
        <div id="dsco-dialog-description">
          <BodyTwoText>{i18n.animationPicker_flaggedImage()}</BodyTwoText>
          <ul>
            <li>
              <BodyTwoText>
                {i18n.animationPicker_flaggedImageNoShare()}
              </BodyTwoText>
            </li>
            <li>
              <BodyTwoText>
                {i18n.animationPicker_flaggedImageNoUpload()}
              </BodyTwoText>
            </li>
            <li>
              <BodyTwoText>
                {i18n.animationPicker_flaggedImageTOS()}
              </BodyTwoText>
            </li>
          </ul>
          {errorMessage && (
            <BodyTwoText style={{color: 'red'}}>{errorMessage}</BodyTwoText>
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
