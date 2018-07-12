import React, {PropTypes} from 'react';
import _ from 'lodash';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {ADD_A_PERSONAL_LOGIN_HELP_URL} from '@cdo/apps/lib/util/urlHelpers';
import {navigateToHref} from '@cdo/apps/utils';
import BootstrapButton from './BootstrapButton';
import PersonalLoginDialog from './PersonalLoginDialog';
import DeleteAccountDialog from './DeleteAccountDialog';

export const DELETE_VERIFICATION_STRING = i18n.deleteAccountDialog_verificationString();

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
  warning: {
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

const getLabelForCheckbox = (id) => {
  switch (id) {
    case 1:
      return (
        <span>
          <strong>{i18n.deleteAccountDialog_checkbox1_1()}</strong>
          {i18n.deleteAccountDialog_checkbox1_2()}
        </span>
      );
    case 2:
      return (
        <span>
          {i18n.deleteAccountDialog_checkbox2_1()}
          <a href={ADD_A_PERSONAL_LOGIN_HELP_URL} target="_blank">
            {i18n.deleteAccountDialog_checkbox2_2()}
          </a>
          {i18n.deleteAccountDialog_checkbox2_3()}
        </span>
      );
    case 3:
      return (
        <span>
          {i18n.deleteAccountDialog_checkboxPreface()}
          <strong>{i18n.deleteAccountDialog_checkbox3()}</strong>
        </span>
      );
    case 4:
      return (
        <span>
          {i18n.deleteAccountDialog_checkboxPreface()}
          <strong>{i18n.deleteAccountDialog_checkbox4()}</strong>
        </span>
      );
    case 5:
      return (
        <span>
          {i18n.deleteAccountDialog_checkboxPreface()}
          <strong>{i18n.deleteAccountDialog_checkbox5()}</strong>
        </span>
      );
  }
};

export const buildCheckboxMap = () => {
  let checkboxMap = {};
  for (var i = 1; i <= 5; i++) {
    checkboxMap[i] = {
      checked: false,
      label: getLabelForCheckbox(i)
    };
  }
  return checkboxMap;
};

const DEFAULT_STATE = {
  isPersonalLoginDialogOpen: false,
  isDeleteAccountDialogOpen: false,
  password: '',
  passwordError: '',
  deleteVerification: '',
  deleteError: '',
  checkboxes: buildCheckboxMap(),
};

export default class DeleteAccount extends React.Component {
  static propTypes = {
    isPasswordRequired: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
  };

  state = DEFAULT_STATE;

  togglePersonalLoginDialog = () => {
    this.setState(state => {
      return {
        ...DEFAULT_STATE,
        isPersonalLoginDialogOpen: !state.isPersonalLoginDialogOpen
      };
    });
  };

  toggleDeleteAccountDialog = () => {
    this.setState(state => {
      return {
        ...DEFAULT_STATE,
        isDeleteAccountDialogOpen: !state.isDeleteAccountDialogOpen
      };
    });
  };

  // Closes PersonalLoginDialog and opens DeleteAccountDialog
  goToDeleteAccountDialog = () => {
    this.setState({
      isPersonalLoginDialogOpen: false,
      isDeleteAccountDialogOpen: true,
    });
  };

  onCheckboxChange = (id) => {
    const checkboxes = {...this.state.checkboxes};
    checkboxes[id].checked = !checkboxes[id].checked;
    this.setState({checkboxes});
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

  allCheckboxesChecked = () => {
    const {checkboxes} = this.state;
    const uncheckedBoxes = _.filter(Object.keys(checkboxes), id => !checkboxes[id].checked);
    return uncheckedBoxes.length === 0;
  };

  isValid = () => {
    const {isPasswordRequired, isTeacher} = this.props;
    const {password, deleteVerification} = this.state;
    const isPasswordValid = isPasswordRequired ? (password.length > 0) : true;
    const areCheckboxesValid = isTeacher ? this.allCheckboxesChecked() : true;
    const isDeleteVerificationValid = deleteVerification === DELETE_VERIFICATION_STRING;

    return isPasswordValid && areCheckboxesValid && isDeleteVerificationValid;
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
    let newState;
    if (responseJSON && responseJSON.error) {
      const passwordErrors = responseJSON.error.current_password;
      newState = {passwordError: passwordErrors[0]};
    } else {
      newState = {deleteError: `Unexpected error: ${xhr.status}`};
    }

    this.setState(newState);
  };

  render() {
    return (
      <div style={styles.container}>
        <hr style={styles.hr} />
        <h2 style={styles.header}>
          {i18n.deleteAccount()}
        </h2>
        <div style={styles.warning}>
          {!this.props.isTeacher && i18n.deleteAccount_studentWarning()}
          {this.props.isTeacher &&
            <div>
              <p>
                {i18n.deleteAccount_teacherWarning1()}
                <strong>{i18n.deleteAccount_teacherWarning2()}</strong>
                {i18n.deleteAccount_teacherWarning3()}
              </p>
              <p>
                {i18n.deleteAccount_teacherWarning4()}
                <a
                  href={ADD_A_PERSONAL_LOGIN_HELP_URL}
                  target="_blank"
                >
                  {i18n.deleteAccount_teacherWarning5()}
                </a>
                {i18n.deleteAccount_teacherWarning6()}
              </p>
            </div>
          }
        </div>
        <div style={styles.buttonContainer}>
          {/* This button intentionally uses BootstrapButton to match other account page buttons */}
          <BootstrapButton
            type="danger"
            text={i18n.deleteAccount()}
            onClick={this.props.isTeacher ? this.togglePersonalLoginDialog : this.toggleDeleteAccountDialog}
          />
        </div>
        <PersonalLoginDialog
          isOpen={this.state.isPersonalLoginDialogOpen}
          onCancel={this.togglePersonalLoginDialog}
          goToDeleteAccountDialog={this.goToDeleteAccountDialog}
        />
        <DeleteAccountDialog
          isOpen={this.state.isDeleteAccountDialogOpen}
          isPasswordRequired={this.props.isPasswordRequired}
          isTeacher={this.props.isTeacher}
          checkboxes={this.state.checkboxes}
          password={this.state.password}
          passwordError={this.state.passwordError}
          deleteVerification={this.state.deleteVerification}
          onCheckboxChange={this.onCheckboxChange}
          onPasswordChange={this.onPasswordChange}
          onDeleteVerificationChange={this.onDeleteVerificationChange}
          onCancel={this.toggleDeleteAccountDialog}
          disableConfirm={!this.isValid()}
          deleteUser={this.deleteUser}
          deleteError={this.state.deleteError}
        />
      </div>
    );
  }
}
