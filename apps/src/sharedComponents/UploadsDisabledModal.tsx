import Modal from '@code-dot-org/component-library/modal';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

interface UploadsDisabledModalProps {
  onClose: () => void;
}

const UploadsDisabledModal: React.FunctionComponent<
  UploadsDisabledModalProps
> = ({onClose}) => {
  return (
    <Modal
      id="uploads-disabled-modal"
      onClose={onClose}
      title={i18n.uploadsDisabledModal_title()}
      customContent={
        <div id="dsco-dialog-description">
          <BodyTwoText>{i18n.uploadsDisabledModal_content()}</BodyTwoText>
          <BodyTwoText>{i18n.uploadsDiabledModal_howToUnblock()}</BodyTwoText>
        </div>
      }
      primaryButtonProps={{
        text: i18n.ok(),
        onClick: onClose,
      }}
    />
  );
};

export default UploadsDisabledModal;
