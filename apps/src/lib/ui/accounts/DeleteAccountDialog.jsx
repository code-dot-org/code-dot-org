import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Header, Field, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';

const DELETE_VERIFICATION_STRING = 'DELETE MY ACCOUNT';
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
    onCancel: PropTypes.func.isRequired,
  };

  state = {
    password: '',
    deleteVerification: '',
  };

  onPasswordChange = (event) => {
    this.setState({
      password: event.target.value
    });
  };

  onDeleteVerificationChange = (event) => {
    this.setState({
      deleteVerification: event.target.value
    });
  };

  isValid = () => {
    const {password, deleteVerification} = this.state;
    return password.length > 0 && deleteVerification === DELETE_VERIFICATION_STRING;
  };

  render() {
    const {isOpen, onCancel} = this.props;

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
          <Field
            label={i18n.deleteAccountDialog_confirmPassword()}
          >
            <input
              type="password"
              style={styles.input}
              value={this.state.password}
              onChange={this.onPasswordChange}
            />
          </Field>
          <Field
            label={i18n.deleteAccountDialog_deleteAccountVerification()}
          >
            <input
              type="text"
              style={styles.input}
              value={this.state.deleteVerification}
              onChange={this.onDeleteVerificationChange}
            />
          </Field>
          <div>
            {i18n.deleteAccountDialog_emailUs()}
          </div>
          <ConfirmCancelFooter
            confirmText={i18n.deleteAccountDialog_button()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={() => {}}
            onCancel={onCancel}
            disableConfirm={!this.isValid()}
            tabIndex="1"
          />
        </div>
      </BaseDialog>
    );
  }
}
