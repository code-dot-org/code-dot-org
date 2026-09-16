import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import AdminAccountDialog from './AdminAccountDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import {
  TeacherWarning,
  StudentWarning,
  getCheckboxes,
} from './DeleteAccountHelpers';
import PersonalLoginDialog from './PersonalLoginDialog';

import styles from './delete-account.module.scss';

export const DELETE_VERIFICATION_STRING =
  i18n.deleteAccountDialog_verificationString();

const DEFAULT_STATE = {
  isPersonalLoginDialogOpen: false,
  isDeleteAccountDialogOpen: false,
  isAdminAccountDialogOpen: false,
  password: '',
  passwordError: '',
  deleteVerification: '',
  deleteError: '',
};

const dependedUponForLogin = ({
  isTeacher,
  hasStudents,
  dependentStudentsCount,
}) => {
  return isTeacher && hasStudents && dependentStudentsCount > 0;
};

export default class DeleteAccount extends React.Component {
  static propTypes = {
    isPasswordRequired: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    dependentStudentsCount: PropTypes.number.isRequired,
    hasStudents: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    // When false, the account can't be deleted by the user (e.g. it's
    // teacher-managed) and we render `managedNote` instead of the delete UI.
    canDelete: PropTypes.bool,
    managedNote: PropTypes.string,
  };

  static defaultProps = {
    canDelete: true,
  };

  constructor(props) {
    super(props);
    const checkboxes = getCheckboxes(
      dependedUponForLogin(props),
      props.hasStudents
    );
    this.state = {...DEFAULT_STATE, checkboxes};
  }

  componentDidUpdate = prevProps => {
    // If dependedUponForLogin has changed, checkboxes need to update accordingly.
    const isDependedUponForLogin = dependedUponForLogin(this.props);
    if (isDependedUponForLogin !== dependedUponForLogin(prevProps)) {
      const checkboxes = getCheckboxes(
        isDependedUponForLogin,
        this.props.hasStudents
      );
      this.setState({checkboxes});
    }
  };

  togglePersonalLoginDialog = () => {
    this.setState(state => {
      return {
        ...DEFAULT_STATE,
        isPersonalLoginDialogOpen: !state.isPersonalLoginDialogOpen,
      };
    });
  };

  toggleAdminAccountDialog = () => {
    this.setState(state => {
      return {
        ...DEFAULT_STATE,
        isAdminAccountDialogOpen: !state.isAdminAccountDialogOpen,
      };
    });
  };

  toggleDeleteAccountDialog = () => {
    this.setState(state => {
      return {
        ...DEFAULT_STATE,
        isDeleteAccountDialogOpen: !state.isDeleteAccountDialogOpen,
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

  onCheckboxChange = id => {
    const checkboxes = {...this.state.checkboxes};
    checkboxes[id].checked = !checkboxes[id].checked;
    this.setState({checkboxes});
  };

  onPasswordChange = event => {
    this.setState({
      password: event.target.value,
    });
  };

  onDeleteVerificationChange = event => {
    this.setState({
      deleteVerification: event.target.value,
    });
  };

  allCheckboxesChecked = () => {
    const {checkboxes} = this.state;
    return Object.keys(checkboxes).every(id => checkboxes[id].checked);
  };

  isValid = () => {
    const {password, deleteVerification} = this.state;
    const isPasswordValid = this.props.isPasswordRequired
      ? password.length > 0
      : true;
    const isDeleteVerificationValid =
      deleteVerification === DELETE_VERIFICATION_STRING;

    return (
      isPasswordValid &&
      this.allCheckboxesChecked() &&
      isDeleteVerificationValid
    );
  };

  deleteUser = () => {
    const payload = {
      password_confirmation: this.state.password,
    };

    $.ajax({
      url: '/users',
      method: 'DELETE',
      data: payload,
    })
      .done(result => {
        navigateToHref('/');
      })
      .fail((jqXhr, _) => {
        this.onFailure(jqXhr);
      });
  };

  onFailure = xhr => {
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
    const {
      isTeacher,
      dependentStudentsCount,
      isPasswordRequired,
      isAdmin,
      canDelete,
      managedNote,
    } = this.props;

    // Teacher-managed (or otherwise non-deletable) accounts can't be deleted by
    // the user; show the explanatory notice instead of the delete controls.
    if (!canDelete) {
      return (
        <div className={styles.container}>
          <hr className={styles.hr} />
          <MuiTypography
            variant="h5"
            component="h2"
            className={styles.header}
            gutterBottom
          >
            {i18n.deleteAccount()}
          </MuiTypography>
          <MuiTypography variant="body2">{managedNote}</MuiTypography>
        </div>
      );
    }

    const {
      isPersonalLoginDialogOpen,
      isAdminAccountDialogOpen,
      isDeleteAccountDialogOpen,
      checkboxes,
      password,
      passwordError,
      deleteVerification,
      deleteError,
    } = this.state;
    const isDependedUponForLogin = dependedUponForLogin(this.props);

    return (
      <div className={styles.container}>
        <hr className={styles.hr} />
        <MuiTypography
          variant="h5"
          component="h2"
          className={styles.header}
          gutterBottom
        >
          {i18n.deleteAccount()}
        </MuiTypography>
        <div className={styles.warning}>
          {isTeacher ? <TeacherWarning /> : <StudentWarning />}
        </div>
        <div className={styles.buttonContainer}>
          <MuiButton
            variant="contained"
            color="error"
            size="small"
            onClick={
              isDependedUponForLogin
                ? this.togglePersonalLoginDialog
                : isAdmin
                ? this.toggleAdminAccountDialog
                : this.toggleDeleteAccountDialog
            }
          >
            {i18n.deleteAccount()}
          </MuiButton>
        </div>
        <PersonalLoginDialog
          isOpen={isPersonalLoginDialogOpen}
          dependentStudentsCount={dependentStudentsCount}
          onCancel={this.togglePersonalLoginDialog}
          onConfirm={this.goToDeleteAccountDialog}
        />
        <AdminAccountDialog
          isOpen={isAdminAccountDialogOpen}
          onCancel={this.toggleAdminAccountDialog}
          onConfirm={this.goToDeleteAccountDialog}
        />
        <DeleteAccountDialog
          isOpen={isDeleteAccountDialogOpen}
          isTeacher={isTeacher}
          isPasswordRequired={isPasswordRequired}
          warnAboutDeletingStudents={isDependedUponForLogin}
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
