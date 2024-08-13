import PropTypes from 'prop-types';
import React from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {
  Header,
  ConfirmCancelFooter,
} from '../../../sharedComponents/SystemDialog/SystemDialog';

const GUTTER = 20;

const AdminAccountDialog = ({isOpen, onCancel, onConfirm}) => {
  return (
    <BaseDialog
      useUpdatedStyles
      fixedWidth={550}
      isOpen={isOpen}
      handleClose={onCancel}
    >
      <div style={styles.container}>
        <Header text={i18n.adminAccountDeletionDialog_header()} />
        <p>
          <strong style={styles.dangerText}>
            {i18n.adminAccountDeletionDialog_body()}
          </strong>
        </p>
        <ConfirmCancelFooter
          confirmText={i18n.continue()}
          onConfirm={onConfirm}
          onCancel={onCancel}
          tabIndex="1"
        />
      </div>
    </BaseDialog>
  );
};

AdminAccountDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

const styles = {
  container: {
    margin: GUTTER,
    color: color.charcoal,
  },
  dangerText: {
    color: color.red,
  },
  studentBox: {
    padding: GUTTER / 2,
    marginBottom: GUTTER / 2,
    backgroundColor: color.background_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 4,
    height: 50,
    overflowY: 'scroll',
  },
  button: {
    display: 'block',
    textAlign: 'center',
    marginBottom: '1em',
  },
};

export default AdminAccountDialog;
