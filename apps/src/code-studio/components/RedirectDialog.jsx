import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {navigateToHref} from '@cdo/apps/utils';

export default class RedirectDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    details: PropTypes.string.isRequired,
    handleClose: PropTypes.func.isRequired,
    redirectUrl: PropTypes.string.isRequired,
    redirectButtonText: PropTypes.string.isRequired
  };

  redirect = () => {
    navigateToHref(this.props.redirectUrl);
  };

  render() {
    const {isOpen, details, handleClose, redirectButtonText} = this.props;

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
            __useDeprecatedTag
            text={i18n.stayHere()}
            onClick={handleClose}
            color={Button.ButtonColor.gray}
          />
          <Button
            __useDeprecatedTag
            text={redirectButtonText}
            onClick={this.redirect}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    padding: 20
  },
  dialogHeader: {
    marginTop: 0
  }
};
