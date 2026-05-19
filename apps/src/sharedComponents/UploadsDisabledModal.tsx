import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
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
          <Typography variant="body2" gutterBottom>
            {i18n.uploadsDisabledModal_content()}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {i18n.uploadsDiabledModal_howToUnblock()}
          </Typography>
        </div>
      }
      primaryButtonProps={{
        children: i18n.ok(),
        onClick: onClose,
      }}
    />
  );
};

export default UploadsDisabledModal;
