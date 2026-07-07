import Alert from '@code-dot-org/component-library/alert';
import Checkbox from '@code-dot-org/component-library/checkbox';
import Modal from '@code-dot-org/component-library/modal';
import TextField from '@code-dot-org/component-library/textField';
import PropTypes from 'prop-types';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import styles from './delete-account-dialog.module.scss';

export default class DeleteAccountDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool,
    isPasswordRequired: PropTypes.bool.isRequired,
    warnAboutDeletingStudents: PropTypes.bool.isRequired,
    checkboxes: PropTypes.objectOf(
      PropTypes.shape({
        checked: PropTypes.bool.isRequired,
        label: PropTypes.object.isRequired,
      })
    ).isRequired,
    password: PropTypes.string.isRequired,
    passwordError: PropTypes.string,
    deleteVerification: PropTypes.string.isRequired,
    onCheckboxChange: PropTypes.func.isRequired,
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
      isTeacher,
      isPasswordRequired,
      warnAboutDeletingStudents,
      checkboxes,
      password,
      passwordError,
      deleteVerification,
      onCheckboxChange,
      onPasswordChange,
      onDeleteVerificationChange,
      onCancel,
      disableConfirm,
      deleteUser,
      deleteError,
    } = this.props;

    if (!isOpen) {
      return null;
    }

    const checkboxesLength = Object.keys(checkboxes).length;

    const renderedMarkdown = isTeacher => {
      let markdownStr = i18n.deleteAccountDialog_body1();

      if (isTeacher) {
        markdownStr = `${markdownStr} ${i18n.deleteAccountDialog_body2_teacher()}`;
      } else {
        markdownStr = `${markdownStr} ${i18n.deleteAccountDialog_body2_student()}`;
      }
      return markdownStr;
    };

    return (
      <Modal
        title={i18n.deleteAccountDialog_header()}
        onClose={onCancel}
        closeLabel={i18n.closeDialog()}
        customContent={
          <div className={styles.container}>
            <Alert
              type="danger"
              text={
                <>
                  <SafeMarkdown
                    unwrapped
                    markdown={renderedMarkdown(isTeacher)}
                  />
                  {warnAboutDeletingStudents && (
                    <SafeMarkdown
                      unwrapped
                      markdown={i18n.deleteAccountDialog_body3()}
                    />
                  )}
                </>
              }
            />
            {checkboxesLength > 0 && (
              <div className={styles.section}>
                <strong>
                  {i18n.deleteAccountDialog_checkboxTitle({
                    numCheckboxes: checkboxesLength,
                  })}
                </strong>
                {Object.keys(checkboxes).map(id => (
                  <div key={id} className={styles.checkboxContainer}>
                    <Checkbox
                      name={id}
                      checked={checkboxes[id].checked}
                      onChange={() => onCheckboxChange(id)}
                      label={checkboxes[id].label}
                    />
                  </div>
                ))}
              </div>
            )}
            {isPasswordRequired && (
              <TextField
                name="currentPassword"
                inputType="password"
                label={i18n.deleteAccountDialog_currentPassword()}
                errorMessage={passwordError}
                value={password}
                onChange={onPasswordChange}
              />
            )}
            <TextField
              name="deleteVerification"
              inputType="text"
              label={i18n.deleteAccountDialog_verification({
                verificationString:
                  i18n.deleteAccountDialog_verificationString(),
              })}
              value={deleteVerification}
              onChange={onDeleteVerificationChange}
            />
            <div className={styles.section}>
              {i18n.deleteAccountDialog_emailUs()}
            </div>
          </div>
        }
        primaryButtonProps={{
          children: warnAboutDeletingStudents
            ? i18n.deleteAccountDialog_button_studentWarning()
            : i18n.deleteAccountDialog_button(),
          color: 'error',
          onClick: deleteUser,
          disabled: disableConfirm,
        }}
        secondaryButtonProps={{
          children: i18n.cancel(),
          onClick: onCancel,
        }}
        customBottomContent={
          deleteError ? (
            <span id="uitest-delete-error" className={styles.dangerText}>
              {deleteError}
            </span>
          ) : undefined
        }
      />
    );
  }
}
