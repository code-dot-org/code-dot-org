import React, {PropTypes} from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {
  TeacherWarning,
  StudentWarning,
  getLabelForCheckbox,
} from './DeleteAccountHelpers';
import {navigateToHref} from '@cdo/apps/utils';
import BootstrapButton from './BootstrapButton';
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
  isDialogOpen: false,
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

  toggleDialog = () => {
    this.setState(state => {
      return {
        ...DEFAULT_STATE,
        isDialogOpen: !state.isDialogOpen
      };
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
    return Object.keys(checkboxes).every(id => checkboxes[id].checked);
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
          {this.props.isTeacher ? <TeacherWarning/> : <StudentWarning/>}
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
          isPasswordRequired={this.props.isPasswordRequired}
          isTeacher={this.props.isTeacher}
          checkboxes={this.state.checkboxes}
          password={this.state.password}
          passwordError={this.state.passwordError}
          deleteVerification={this.state.deleteVerification}
          onCheckboxChange={this.onCheckboxChange}
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
