import Modal from '@code-dot-org/component-library/modal';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

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
      title="Warning: Inappropriate Image"
      customContent={
        <div>
          <BodyTwoText>
            This image has been flagged as inappropriate. By including this
            image in your project, you will be unable to share the project with
            others.
          </BodyTwoText>
        </div>
      }
      primaryButtonProps={{
        text: 'Accept',
        onClick: onAccept,
      }}
      secondaryButtonProps={{
        text: 'Cancel',
        onClick: onCancel,
      }}
    />
  );
};

export default FlaggedImageModal;
