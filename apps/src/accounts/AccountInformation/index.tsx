import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import {hashEmail} from '@cdo/apps/code-studio/hashEmail';
import Alert, {alertTypes} from '@cdo/apps/componentLibrary/alert/Alert';
import {Button} from '@cdo/apps/componentLibrary/button';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Link from '@cdo/apps/componentLibrary/link/Link';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

import ChangeEmailModal from '../ChangeEmail/ChangeEmailModal';

import {AccountInformationProps} from './types';

import styles from './style.module.scss';
import commonStyles from '../common/common.styles.module.scss';

export const AccountInformation: React.FC<AccountInformationProps> = ({
  verifiedTeacher,
  secretPictureAccountOnly,
  teacherManagedAccount,
  parentManagedAccount,
  shouldSeeEditEmailLink,
  isPasswordRequired,
  isStudent,
  migrated,
  userType,
  userAge,
  userUsername,
  userDisplayName,
  userProperties,
  userEmail,
  hashedEmail,
  encryptedPasswordPresent,
  canEditPassword,
  sponsored,
  ageDropdownOptions,
  studentInLockoutFlow,
  showGenderInput,
  usStateDropdownOptions,
  countryCode,
  isUSA,
}) => {
  const [name, setName] = useState(userDisplayName ?? '');
  const [username, setUsername] = useState(userUsername ?? '');
  const [email, setEmail] = useState(userEmail ?? '');
  const [gender, setGender] = useState(
    userProperties?.gender_student_input ?? ''
  );
  const [age, setAge] = useState(userAge ?? '');
  const [usState, setUsState] = useState(userProperties?.us_state ?? '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showAccountUpdateSuccess, setShowAccountUpdateSuccess] =
    useState(false);
  const [showEmailUpdateSuccess, setShowEmailUpdateSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const displayNameHelperMessage = useMemo(
    () =>
      isStudent ? undefined : i18n.accountInformation_displayNameHintTeacher(),
    [isStudent]
  );

  const emailValue = useMemo(
    () => (isStudent ? `***${i18n.encrypted()}***` : email ?? ''),
    [isStudent, email]
  );

  const usStateOptions = useMemo(
    () =>
      [[i18n.accountInformation_selectState(), '']]
        .concat(usStateDropdownOptions)
        .map(([text, value]) => ({text, value})),
    [usStateDropdownOptions]
  );

  const lockedOutStudentMessage = useMemo(
    () =>
      studentInLockoutFlow
        ? i18n.accountInformation_updateFieldParentPermissionRequired()
        : undefined,
    [studentInLockoutFlow]
  );

  const handleSubmitAccountSettingsUpdate = async () => {
    resetMessages();
    setErrors({});
    const userUpdates = {
      name,
      username,
      password,
      password_confirmation: passwordConfirmation,
      current_password: currentPassword,
      age: isStudent ? age : '21+',
      gender_student_input: isStudent && gender ? gender : undefined,
      us_state: isStudent && isUSA ? usState : undefined,
      country_code: isStudent ? countryCode : undefined,
    };
    const response = await fetch('/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({
        user: userUpdates,
      }),
    });

    if (response.ok) {
      setShowAccountUpdateSuccess(true);
    } else {
      const validationErrors = await response.json();
      setErrors(validationErrors);
    }
  };

  const handleSubmitEmailUpdate = async ({
    newEmail,
    currentPassword,
    emailOptIn,
  }: {
    newEmail: string;
    currentPassword: string;
    emailOptIn: string;
  }) => {
    resetMessages();
    const hashedEmail = hashEmail(newEmail);
    const response = await fetch('/users/email', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({
        user: {
          email: newEmail,
          current_password: currentPassword,
          hashed_email: hashedEmail,
          email_preference_opt_in: emailOptIn,
        },
      }),
    });

    if (!response.ok) {
      const validationErrors = await response.json();
      let error;
      if (validationErrors) {
        error = {
          serverErrors: {
            newEmail: validationErrors.email && validationErrors.email[0],
            currentPassword:
              validationErrors.current_password &&
              validationErrors.current_password[0],
          },
        };
      } else {
        error = new Error('Unexpected failure: ' + response.status);
      }
      // error is handled in ChangeEmailModal
      throw error;
    }

    // update succeeded, hide modal and update email state with the new email
    setShowChangeEmailModal(false);
    setEmail(newEmail);
    setShowEmailUpdateSuccess(true);
  };

  const resetMessages = () => {
    setShowAccountUpdateSuccess(false);
    setShowEmailUpdateSuccess(false);
  };

  const getError = (key: string): string | undefined => errors[key]?.[0];

  const clearError = (key: string) => {
    if (errors[key]) {
      const errorsCopy = {...errors};
      delete errorsCopy[key];
      setErrors(errorsCopy);
    }
  };

  return (
    <>
      <hr />
      <Heading2
        visualAppearance="heading-sm"
        className={commonStyles.sectionHeader}
      >
        {i18n.accountInformation_accountInformation()}
      </Heading2>
      <form name="account-information-form" className={styles.accountForm}>
        <div className={commonStyles.inputContainer}>
          {/* verified teacher account */}
          {verifiedTeacher && (
            <div className="field">
              <label className={styles.verifiedTeacher}>
                ✔ {i18n.accountInformation_verifiedTeacher()}
              </label>
            </div>
          )}

          {/* display name */}
          <TextField
            id="user_name"
            className={commonStyles.input}
            label={i18n.displayName()}
            onChange={e => {
              setName(e.target.value);
              clearError('name');
            }}
            value={name}
            name="user[name]"
            readOnly={secretPictureAccountOnly}
            maxLength={255}
            helperMessage={displayNameHelperMessage}
            errorMessage={getError('name')}
          />

          {/* username */}
          {userUsername && (
            <TextField
              id="user_username"
              className={commonStyles.input}
              label={i18n.username()}
              onChange={e => {
                setUsername(e.target.value);
                clearError('username');
              }}
              value={username}
              name="user[username]"
              maxLength={20}
              minLength={5}
              errorMessage={getError('username')}
            />
          )}

          {/* email */}
          {!teacherManagedAccount && !parentManagedAccount && (
            <div>
              <TextField
                id="user_email"
                className={classNames(commonStyles.input, styles.emailInput)}
                label={i18n.emailAddress()}
                helperMessage={
                  migrated && !isStudent
                    ? i18n.accountInformation_emailHint()
                    : undefined
                }
                readOnly={true}
                onChange={() => {}}
                value={emailValue}
                name="user[email]"
                errorMessage={getError('email')}
              />
              {/* TODO: replace Link with design system semantic button styled as an inline link when it exists */}
              {shouldSeeEditEmailLink && (
                <Link
                  role="button"
                  href="#"
                  text={i18n.accountInformation_updateEmail()}
                  onClick={e => {
                    e.preventDefault();
                    setShowChangeEmailModal(true);
                  }}
                  size="s"
                />
              )}
              {showEmailUpdateSuccess && (
                <Alert
                  text={i18n.accountInformation_emailUpdateSuccess()}
                  type={alertTypes.success}
                  className={styles.alert}
                  onClose={() => setShowEmailUpdateSuccess(false)}
                />
              )}
              {showChangeEmailModal && (
                <ChangeEmailModal
                  handleSubmit={handleSubmitEmailUpdate}
                  handleCancel={() => setShowChangeEmailModal(false)}
                  userType={userType}
                  isPasswordRequired={isPasswordRequired}
                  currentHashedEmail={hashedEmail}
                />
              )}
            </div>
          )}

          {/* no password because sponsored hint text */}
          {sponsored && (
            <div className="field">
              <label className="label-bold">
                {i18n.accountInformation_noPasswordBecauseSponsored()}
              </label>
            </div>
          )}

          {canEditPassword && encryptedPasswordPresent && (
            <>
              {/* new password */}
              <TextField
                id="user_password"
                className={commonStyles.input}
                label={i18n.password()}
                onChange={e => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                value={password}
                name="user[password]"
                inputType="password"
                autoComplete="off"
                maxLength={255}
                errorMessage={getError('password')}
              />

              {/* new password confirmation */}
              <TextField
                id="user_password_confirmation"
                className={commonStyles.input}
                label={i18n.passwordConfirmation()}
                onChange={e => {
                  setPasswordConfirmation(e.target.value);
                  clearError('password_confirmation');
                }}
                value={passwordConfirmation}
                name="user[password_confirmation]"
                inputType="password"
                autoComplete="off"
                maxLength={255}
                errorMessage={getError('password_confirmation')}
              />
            </>
          )}

          {/* current password */}
          {encryptedPasswordPresent && (
            <TextField
              id="user_current_password"
              className={commonStyles.input}
              label={i18n.accountInformation_currentPassword()}
              helperMessage={i18n.accountInformation_currentPasswordHint()}
              onChange={e => {
                setCurrentPassword(e.target.value);
                clearError('current_password');
              }}
              value={currentPassword}
              name="user[current_password]"
              inputType="password"
              maxLength={255}
              errorMessage={getError('current_password')}
            />
          )}

          {isStudent && (
            <>
              {/* student age */}
              <SimpleDropdown
                id="user_age"
                labelText={i18n.age()}
                name="user[age]"
                selectedValue={age}
                onChange={e => {
                  setAge(e.target.value);
                  clearError('age');
                }}
                items={ageDropdownOptions.map((value: string | number) => ({
                  value: String(value),
                  text: String(value),
                }))}
                disabled={studentInLockoutFlow}
                dropdownTextThickness="thin"
                className={commonStyles.input}
                helperMessage={lockedOutStudentMessage}
                errorMessage={getError('age')}
              />

              {/* student gender */}
              {showGenderInput && (
                <TextField
                  id="user_gender_student_input"
                  className={commonStyles.input}
                  label={i18n.genderOptional()}
                  onChange={e => setGender(e.target.value)}
                  value={gender}
                  name="user[gender_student_input]"
                  maxLength={50}
                />
              )}

              {/* US state */}
              {isUSA && (
                <SimpleDropdown
                  id="user_us_state"
                  labelText={i18n.usState()}
                  name="user[us_state]"
                  selectedValue={usState}
                  onChange={e => {
                    setUsState(e.target.value);
                    clearError('us_state');
                  }}
                  items={usStateOptions}
                  disabled={studentInLockoutFlow}
                  dropdownTextThickness="thin"
                  className={commonStyles.input}
                  helperMessage={lockedOutStudentMessage}
                  errorMessage={getError('us_state')}
                />
              )}
            </>
          )}
          {Object.keys(errors).length > 0 && (
            <Alert
              text={i18n.accountInformation_reviewErrors()}
              type={alertTypes.danger}
              className={commonStyles.alert}
            />
          )}
          {showAccountUpdateSuccess && (
            <Alert
              id="account-update-success"
              text={i18n.accountInformation_updateSuccess()}
              type={alertTypes.success}
              onClose={() => setShowAccountUpdateSuccess(false)}
              className={commonStyles.alert}
            />
          )}
        </div>
        <div>
          <Button
            id="submit-update"
            className={commonStyles.submit}
            text={i18n.accountInformation_updateAccountInformation()}
            onClick={handleSubmitAccountSettingsUpdate}
          />
        </div>
      </form>
    </>
  );
};
