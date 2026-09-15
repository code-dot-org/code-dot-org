import Modal from '@code-dot-org/component-library/modal';
import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './admin-account-dialog.module.scss';

const AdminAccountDialog = ({isOpen, onCancel, onConfirm}) => {
  if (!isOpen) {
    return null;
  }
  return (
    <Modal
      title={i18n.adminAccountDeletionDialog_header()}
      onClose={onCancel}
      closeLabel={i18n.closeDialog()}
      customContent={
        <MuiTypography
          variant="body2"
          component="p"
          className={styles.dangerText}
        >
          <strong>{i18n.adminAccountDeletionDialog_body()}</strong>
        </MuiTypography>
      }
      primaryButtonProps={{
        children: i18n.continue(),
        onClick: onConfirm,
      }}
      secondaryButtonProps={{
        children: i18n.cancel(),
        onClick: onCancel,
      }}
    />
  );
};

AdminAccountDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default AdminAccountDialog;
