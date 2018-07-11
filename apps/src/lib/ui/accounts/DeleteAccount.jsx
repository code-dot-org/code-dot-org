import React from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {navigateToHref} from '@cdo/apps/utils';
import BootstrapButton from './BootstrapButton';
import DeleteAccountDialog from './DeleteAccountDialog';

const DELETE_VERIFICATION_STRING = i18n.deleteAccountDialog_verificationString();
const styles = {
  container: {
    paddingTop: 20,
  },
  hr: {
    borderColor: color.red,
  },
  header: {
    fontSize: 22,
    color: color.red,
  },
  hint: {
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

export default class DeleteAccount extends React.Component {
  state = {
    isDialogOpen: false,
    password: '',
    passwordError: '',
    deleteVerification: '',
    deleteError: '',
  };

  toggleDialog = () => {
    this.setState(state => {
      return {
        isDialogOpen: !state.isDialogOpen
      };
    });
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

  deleteUser = () => {
    const payload = {
      new_destroy_flow: true,
      password_confirmation: this.state.password
    };

    $.ajax({
      url: '/users',
      method: 'DELETE',
      data: payload
    }).done(result => {
      navigateToHref('/');
    }).fail((jqXhr, _) => {
      this.onFailure(jqXhr);
    });
  };

  onFailure = (xhr) => {
    const responseJSON = xhr.responseJSON;
    if (responseJSON && responseJSON.error) {
      const passwordErrors = responseJSON.error.current_password;
      this.setState({
        passwordError: passwordErrors[0]
      });
    } else {
      this.setState({
        deleteError: `Unexpected error: ${xhr.status}`
      });
    }
  };

  render() {
    return (
      <div style={styles.container}>
        <hr style={styles.hr} />
        <h2 style={styles.header}>
          {i18n.deleteAccount()}
        </h2>
        <div style={styles.hint}>
          {i18n.deleteAccount_hint()}
        </div>
        <div style={styles.buttonContainer}>
          {/* This button intentionally uses BootstrapButton to match other account page buttons */}
          <BootstrapButton
            type="danger"
            text={i18n.deleteAccount()}
            onClick={this.toggleDialog}
          />
        </div>
        <DeleteAccountDialog
          isOpen={this.state.isDialogOpen}
          password={this.state.password}
          passwordError={this.state.passwordError}
          deleteVerification={this.state.deleteVerification}
          onPasswordChange={this.onPasswordChange}
          onDeleteVerificationChange={this.onDeleteVerificationChange}
          onCancel={this.toggleDialog}
          disableConfirm={!this.isValid()}
          deleteUser={this.deleteUser}
          deleteError={this.state.deleteError}
        />
      </div>
    );
  }
}
