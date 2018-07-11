import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Header, Field, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';

const GUTTER = 20;
const styles = {
  container: {
    margin: GUTTER,
    color: color.charcoal,
  },
  bodyContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: GUTTER,
  },
  icon: {
    color: color.red,
    fontSize: 100,
  },
  text: {
    fontSize: 16,
    paddingLeft: GUTTER,
  },
  dangerText: {
    color: color.red,
  },
  input: {
    width: 490
  },
};

export default class DeleteAccountDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isPasswordRequired: PropTypes.bool.isRequired,
    password: PropTypes.string.isRequired,
    passwordError: PropTypes.string,
    deleteVerification: PropTypes.string.isRequired,
    onPasswordChange: PropTypes.func.isRequired,
    onDeleteVerificationChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    disableConfirm: PropTypes.bool.isRequired,
    deleteUser: PropTypes.func.isRequired,
    deleteError: PropTypes.string,
  };

  render() {
    const {
      isOpen,
      isPasswordRequired,
      password,
      passwordError,
      deleteVerification,
      onPasswordChange,
      onDeleteVerificationChange,
      onCancel,
      disableConfirm,
      deleteUser,
      deleteError,
    } = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={550}
        isOpen={isOpen}
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={i18n.deleteAccountDialog_header()}/>
          <div style={styles.bodyContainer}>
            <FontAwesome
              icon="exclamation-triangle"
              style={styles.icon}
            />
            <div style={styles.text}>
              <strong>{i18n.deleteAccountDialog_body1()}</strong>
              {i18n.deleteAccountDialog_body2()}
              <strong style={styles.dangerText}>{i18n.deleteAccountDialog_body3()}</strong>
              {i18n.deleteAccountDialog_body4()}
            </div>
          </div>
          {isPasswordRequired &&
            <Field
              label={i18n.deleteAccountDialog_currentPassword()}
              error={passwordError}
            >
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={onPasswordChange}
              />
            </Field>
          }
          <Field
            label={i18n.deleteAccountDialog_verification({verificationString: i18n.deleteAccountDialog_verificationString()})}
          >
            <input
              type="text"
              style={styles.input}
              value={deleteVerification}
              onChange={onDeleteVerificationChange}
            />
          </Field>
          <div>
            {i18n.deleteAccountDialog_emailUs()}
          </div>
          <ConfirmCancelFooter
            confirmText={i18n.deleteAccountDialog_button()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={deleteUser}
            onCancel={onCancel}
            disableConfirm={disableConfirm}
            tabIndex="1"
          >
            <span style={styles.dangerText}>{deleteError}</span>
          </ConfirmCancelFooter>
        </div>
      </BaseDialog>
    );
  }
}
