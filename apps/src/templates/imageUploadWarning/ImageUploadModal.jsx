// Warning dialog that says if you upload, you can no longer share and remix,
// and you confirm you will not upload PII.
import Checkbox from '@code-dot-org/component-library/checkbox';
import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import msg from '@cdo/locale';

import styles from './image-upload-warning.module.scss';

export default function ImageUploadModal({
  isOpen,
  cancelUpload,
  isTeacher,
  confirmUploadWarning,
}) {
  const [noPIIConfirmed, setNoPIIConfirmed] = useState(false);
  const [restrictedShareConfirmed, setRestrictedShareConfirmed] =
    useState(false);

  const isConfirmButtonEnabled = isTeacher
    ? noPIIConfirmed
    : noPIIConfirmed && restrictedShareConfirmed;

  const onCancel = () => {
    setNoPIIConfirmed(false);
    setRestrictedShareConfirmed(false);
    cancelUpload();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title={msg.animationPicker_restrictedShareRulesHeader()}
      onClose={onCancel}
      customContent={
        <div className={styles.modalContent}>
          <Checkbox
            name="noPIIConfirmed"
            checked={noPIIConfirmed}
            onChange={() => setNoPIIConfirmed(!noPIIConfirmed)}
            label={msg.animationPicker_confirmNoPII()}
          />
          {!isTeacher && (
            <Checkbox
              name="restrictedShareConfirmed"
              checked={restrictedShareConfirmed}
              onChange={() =>
                setRestrictedShareConfirmed(!restrictedShareConfirmed)
              }
              label={msg.animationPicker_confirmRestrictedShare()}
            />
          )}
          <Typography
            id="dsco-dialog-description"
            variant="body4"
            className={styles.modalDetails}
          >
            {isTeacher && (
              <>
                {msg.animationPicker_warnNoRemix()}
                <br />
              </>
            )}
            {msg.animationPicker_undoRestrictedShareInstructions()}
          </Typography>
        </div>
      }
      primaryButtonProps={{
        children: msg.dialogOK(),
        onClick: confirmUploadWarning,
        disabled: !isConfirmButtonEnabled,
      }}
      secondaryButtonProps={{
        children: msg.dialogCancel(),
        onClick: onCancel,
      }}
    />
  );
}

ImageUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  cancelUpload: PropTypes.func.isRequired,
  confirmUploadWarning: PropTypes.func.isRequired,
  isTeacher: PropTypes.bool.isRequired,
};
