import Modal from '@code-dot-org/component-library/modal';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

interface FlaggedImageModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

const FlaggedImageModal: React.FC<FlaggedImageModalProps> = ({
  isOpen,
  onAccept,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      id="image-flagged-modal"
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
        </div>
      }
      primaryButtonProps={{
        text: i18n.accept(),
        onClick: onAccept,
      }}
      secondaryButtonProps={{
        text: i18n.cancel(),
        onClick: onCancel,
      }}
    />
  );
};

export default FlaggedImageModal;
