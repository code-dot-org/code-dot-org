import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import {Header, ConfirmCancelFooter} from '../../lib/ui/SystemDialog/SystemDialog';
import BaseDialog from '../BaseDialog';
import Button from "../Button";
import color from "../../util/color";

export default class ConfirmRemoveStudentDialog extends React.Component {
  static propTypes = {
    isOpen: BaseDialog.propTypes.isOpen,
    disabled: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  render() {
    const {isOpen, disabled, onConfirm, onCancel} = this.props;
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={isOpen}
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={i18n.removeStudentHeader()}/>
          <p>
            <strong>{i18n.removeStudentBody1()}</strong>
            {' '}
            {i18n.removeStudentBody2()}
          </p>
          <p>
            {i18n.removeStudentBody3()}
          </p>
          <Button
            text={i18n.removeStudentSendHomeInstructions()}
            target="_blank"
            href="https://support.code.org/hc/en-us/articles/115001475131-Adding-a-personal-login-to-a-teacher-created-account"
            color={Button.ButtonColor.blue}
            size={Button.ButtonSize.large}
            style={styles.sendHomeInstructionsButton}
            tabIndex="1"
          />
          <p>
            {i18n.removeStudentBody4()}
          </p>
          <ConfirmCancelFooter
            confirmText={i18n.removeStudent()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={onConfirm}
            onCancel={onCancel}
            disableConfirm={disabled}
            disableCancel={disabled}
            tabIndex="1"
          />
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
  },
  sendHomeInstructionsButton: {
    display: 'block',
    textAlign: 'center',
    marginBottom: '1em',
  }
};
