// Warning dialog that says if you upload, you can no longer share and remix,
// and you confirm you will not upload PII.
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
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

  return (
    <BaseDialog isOpen={isOpen} handleClose={onCancel}>
      <div>
        <h1 className={styles.modalHeader}>
          {msg.animationPicker_restrictedShareRulesHeader()}
        </h1>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={noPIIConfirmed}
            onChange={() => setNoPIIConfirmed(!noPIIConfirmed)}
          />
          {msg.animationPicker_confirmNoPII()}
        </label>
        {!isTeacher && (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={restrictedShareConfirmed}
              onChange={() =>
                setRestrictedShareConfirmed(!restrictedShareConfirmed)
              }
            />
            {msg.animationPicker_confirmRestrictedShare()}
          </label>
        )}
        <p className={styles.modalDetails}>
          {isTeacher && (
            <>
              {msg.animationPicker_warnNoPublishShare()}
              <br />
            </>
          )}
          {msg.animationPicker_undoRestrictedShareInstructions()}
        </p>
      </div>
      <div className={styles.modalButtonRow}>
        <button
          className={classNames(styles.modalButton, styles.cancelButton)}
          type="button"
          onClick={onCancel}
        >
          {msg.dialogCancel()}
        </button>
        <button
          className={classNames(styles.modalButton, styles.confirmButton)}
          type="button"
          onClick={confirmUploadWarning}
          disabled={!isConfirmButtonEnabled}
        >
          {msg.dialogOK()}
        </button>
      </div>
    </BaseDialog>
  );
}

ImageUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  cancelUpload: PropTypes.func.isRequired,
  confirmUploadWarning: PropTypes.func.isRequired,
  isTeacher: PropTypes.bool.isRequired,
};
