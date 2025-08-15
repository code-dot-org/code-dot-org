import Modal from '@code-dot-org/component-library/modal';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

interface UploadsDisabledModalProps {
  onClose: () => void;
}

const FlaggedImageModal: React.FunctionComponent<UploadsDisabledModalProps> = ({
  onClose,
}) => {
  return (
    <Modal
      id="uploads-disabled-modal"
      onClose={onClose}
      title={'Uploads Disabled'}
      customContent={
        <div id="dsco-dialog-description">
          <BodyTwoText>
            This project has been flagged for abusive content so uploading new
            files is disabled.
          </BodyTwoText>
          <BodyTwoText>
            If this project was flagged as abusive because of an uploaded image,
            you can unblock the project by removing the flagged image from your
            project.
          </BodyTwoText>
        </div>
      }
      primaryButtonProps={{
        text: i18n.ok(),
        onClick: onClose,
      }}
    />
  );
};

export default FlaggedImageModal;
