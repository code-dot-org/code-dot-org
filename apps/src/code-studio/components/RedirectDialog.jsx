import Button from '@code-dot-org/component-library/button';
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
        <Button
          text={i18n.stayHere()}
          onClick={handleClose}
          type="secondary"
          color="gray"
          size="s"
        />
        <Button
          text={redirectButtonText}
          onClick={redirect}
          type="primary"
          color="purple"
          size="s"
        />
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
