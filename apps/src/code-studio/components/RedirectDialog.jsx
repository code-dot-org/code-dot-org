import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

const RedirectDialog = ({
  isOpen,
  details,
  handleClose,
  redirectUrl,
  redirectButtonText,
}) => {
  const redirect = () => {
    navigateToHref(redirectUrl);
  };

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={isOpen}
      style={styles.dialog}
      handleClose={handleClose}
    >
      <div>
        <h2 style={styles.dialogHeader}>{i18n.notInRightPlace()}</h2>
        {details}
      </div>
      <DialogFooter>
        <MuiButton
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={handleClose}
          type="button"
        >
          {i18n.stayHere()}
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          onClick={redirect}
          type="button"
        >
          {redirectButtonText}
        </MuiButton>
      </DialogFooter>
    </BaseDialog>
  );
};

RedirectDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  details: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  redirectUrl: PropTypes.string.isRequired,
  redirectButtonText: PropTypes.string.isRequired,
};

const styles = {
  dialog: {
    padding: 20,
  },
  dialogHeader: {
    marginTop: 0,
  },
};

export default RedirectDialog;
