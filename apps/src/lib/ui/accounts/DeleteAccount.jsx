import React, {PropTypes} from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {
  TeacherWarning,
  StudentWarning,
  getCheckboxes,
} from './DeleteAccountHelpers';
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

const DEFAULT_STATE = {
  isPersonalLoginDialogOpen: false,
  isDeleteAccountDialogOpen: false,
  password: '',
  passwordError: '',
  deleteVerification: '',
  deleteError: '',
};

export default class DeleteAccount extends React.Component {
  static propTypes = {
    isPasswordRequired: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    dependedUponForLogin: PropTypes.bool.isRequired,
    hasStudents: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    const checkboxes = getCheckboxes(props.dependedUponForLogin, props.hasStudents);
    this.state = {...DEFAULT_STATE, checkboxes};
  }

  componentDidUpdate = (prevProps) => {
    // If dependedUponForLogin or hasStudents props have changed,
    // checkboxes need to update accordingly.
    const {dependedUponForLogin, hasStudents} = this.props;
    if (dependedUponForLogin !== prevProps.dependedUponForLogin || hasStudents !== prevProps.hasStudents) {
      const checkboxes = getCheckboxes(dependedUponForLogin, hasStudents);
      this.setState({checkboxes});
    }
  };

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
    return Object.keys(checkboxes).every(id => checkboxes[id].checked);
  };

  isValid = () => {
    const {password, deleteVerification} = this.state;
    const isPasswordValid = this.props.isPasswordRequired ? (password.length > 0) : true;
    const isDeleteVerificationValid = deleteVerification === DELETE_VERIFICATION_STRING;

    return isPasswordValid && this.allCheckboxesChecked() && isDeleteVerificationValid;
  };

  deleteUser = () => {
    const payload = {
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
    const {isTeacher, dependedUponForLogin, isPasswordRequired} = this.props;
    const {
      isPersonalLoginDialogOpen,
      isDeleteAccountDialogOpen,
      checkboxes,
      password,
      passwordError,
      deleteVerification,
      deleteError,
    } = this.state;

    return (
      <div style={styles.container}>
        <hr style={styles.hr} />
        <h2 style={styles.header}>
          {i18n.deleteAccount()}
        </h2>
        <div style={styles.warning}>
          {isTeacher ? <TeacherWarning/> : <StudentWarning/>}
        </div>
        <div style={styles.buttonContainer}>
          {/* This button intentionally uses BootstrapButton to match other account page buttons */}
          <BootstrapButton
            type="danger"
            text={i18n.deleteAccount()}
            onClick={(isTeacher && dependedUponForLogin) ? this.togglePersonalLoginDialog : this.toggleDeleteAccountDialog}
          />
        </div>
        <PersonalLoginDialog
          isOpen={isPersonalLoginDialogOpen}
          onCancel={this.togglePersonalLoginDialog}
          onConfirm={this.goToDeleteAccountDialog}
        />
        <DeleteAccountDialog
          isOpen={isDeleteAccountDialogOpen}
          isTeacher={isTeacher}
          isPasswordRequired={isPasswordRequired}
          warnAboutDeletingStudents={isTeacher && dependedUponForLogin}
          checkboxes={checkboxes}
          password={password}
          passwordError={passwordError}
          deleteVerification={deleteVerification}
          onCheckboxChange={this.onCheckboxChange}
          onPasswordChange={this.onPasswordChange}
          onDeleteVerificationChange={this.onDeleteVerificationChange}
          onCancel={this.toggleDeleteAccountDialog}
          disableConfirm={!this.isValid()}
          deleteUser={this.deleteUser}
          deleteError={deleteError}
        />
      </div>
    );
  }
}
