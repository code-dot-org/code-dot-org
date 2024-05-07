// Warning dialog that you cannot upload until you un-publish your project.
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import msg from '@cdo/locale';

import styles from './image-upload-warning.module.scss';

export default function PublishedWarningModal({isOpen, onClose}) {
  return (
    <BaseDialog isOpen={isOpen} handleClose={onClose}>
      <div>
        <h1 className={styles.modalHeader}>
          {msg.animationPicker_cannotUploadHeader()}
        </h1>
        <p>{msg.animationPicker_cannotUploadIfPublished()}</p>
      </div>
      <div className={styles.modalButtonRow}>
        <button
          className={classNames(styles.modalButton, styles.confirmButton)}
          type="button"
          onClick={onClose}
        >
          {msg.dialogOK()}
        </button>
      </div>
    </BaseDialog>
  );
}

PublishedWarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
