import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import i18n from '@cdo/locale';

import {hashEmail} from '../../code-studio/hashEmail';
import Alert, {alertTypes} from '../../componentLibrary/alert/Alert';
import {Button} from '../../componentLibrary/button';
import {SimpleDropdown} from '../../componentLibrary/dropdown';
import Link from '../../componentLibrary/link/Link';
import {Heading2} from '../../componentLibrary/typography';
import {getAuthenticityToken} from '../../util/AuthenticityTokenStore';
import ChangeEmailModal from '../ChangeEmailModal';

import {AccountInformationProps} from './types';

import styles from './style.module.scss';

export const AccountInformation: React.FC<AccountInformationProps> = ({
  authorizedTeacher,
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
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const displayNameHelperMessage = useMemo(
    () =>
      isStudent ? undefined : i18n.accountInformationDisplayNameHintTeacher(),
    [isStudent]
  );

  const emailValue = useMemo(
    () => (isStudent ? `***${i18n.encrypted()}***` : email ?? ''),
    [isStudent, email]
  );

  const usStateOptions = useMemo(
    () =>
      [[i18n.accountInformationSelectState(), '']]
        .concat(usStateDropdownOptions)
        .map(([text, value]) => ({text, value})),
    [usStateDropdownOptions]
  );

  const handleSubmitAccountSettingsUpdate = async () => {
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
      const {redirect_url} = await response.json();
      if (redirect_url) {
        /**
         * This refreshes the page so the success flash message from rails/devise is shown.
         * TODO: When the full account page is 100% react, we'll drop the flash message in
         * favor of the design system Alert component for each section
         */
        window.location.href = redirect_url;
      }
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
  };

  return (
    <>
      <hr />
      <Heading2 visualAppearance="heading-sm" className={styles.sectionHeader}>
        Account information
      </Heading2>
      <form>
        <div className={styles.inputContainer}>
          {/* verified teacher account */}
          {authorizedTeacher && (
            <div className="field">
              <label className={styles.authorizedTeacher}>
                ✔ {i18n.accountInformationVerifiedTeacher()}
              </label>
            </div>
          )}

          {/* display name */}
          <TextField
            className={styles.input}
            label={i18n.accountInformationDisplayName()}
            onChange={e => setName(e.target.value)}
            value={name}
            name="user[name]"
            readOnly={secretPictureAccountOnly}
            maxLength={255}
            helperMessage={displayNameHelperMessage}
            errorMessage={errors.name?.[0]}
          />

          {/* username */}
          {userUsername && (
            <TextField
              className={styles.input}
              label={i18n.accountInformationUsername()}
              onChange={e => setUsername(e.target.value)}
              value={username}
              name="user[username]"
              maxLength={20}
              minLength={5}
              errorMessage={errors.username?.[0]}
            />
          )}

          {/* email */}
          {!teacherManagedAccount && !parentManagedAccount && (
            <>
              <TextField
                className={classNames(styles.input, styles.emailInput)}
                label={i18n.accountInformationEmail()}
                helperMessage={
                  migrated && !isStudent
                    ? i18n.accountInformationEmailHint()
                    : undefined
                }
                readOnly={true}
                onChange={() => {}}
                value={emailValue}
                name="user[email]"
                errorMessage={errors.email?.[0]}
              />
              {/* TODO: replace Link with design system semantic button styled as an inline link when it exists */}
              {shouldSeeEditEmailLink && (
                <Link
                  role="button"
                  href="#"
                  text={i18n.accountInformationUpdateEmail()}
                  onClick={e => {
                    e.preventDefault();
                    setShowChangeEmailModal(true);
                  }}
                  className={styles.link}
                  size="s"
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
            </>
          )}

          {/* no password because sponsored hint text */}
          {sponsored && (
            <div className="field">
              <label className="label-bold">
                {i18n.accountInformationNoPasswordBecauseSponsored()}
              </label>
            </div>
          )}

          {canEditPassword && encryptedPasswordPresent && (
            <>
              {/* new password */}
              <TextField
                className={styles.input}
                label={i18n.accountInformationPassword()}
                onChange={e => setPassword(e.target.value)}
                value={password}
                name="user[password]"
                inputType="password"
                autoComplete="off"
                maxLength={255}
                errorMessage={errors.password?.[0]}
              />

              {/* new password confirmation */}
              <TextField
                className={styles.input}
                label={i18n.accountInformationPasswordConfirmation()}
                onChange={e => setPasswordConfirmation(e.target.value)}
                value={passwordConfirmation}
                name="user[password_confirmation]"
                inputType="password"
                autoComplete="off"
                maxLength={255}
                errorMessage={errors.password_confirmation?.[0]}
              />
            </>
          )}

          {/* current password */}
          {encryptedPasswordPresent && (
            <TextField
              className={styles.input}
              label={i18n.accountInformationCurrentPassword()}
              helperMessage={i18n.accountInformationCurrentPasswordHint()}
              onChange={e => setCurrentPassword(e.target.value)}
              value={currentPassword}
              name="user[current_password]"
              inputType="password"
              maxLength={255}
              errorMessage={errors.current_password?.[0]}
            />
          )}

          {isStudent && (
            <>
              {/* student age */}
              <SimpleDropdown
                labelText={i18n.age()}
                name="user[age]"
                selectedValue={age}
                onChange={e => setAge(e.target.value)}
                items={ageDropdownOptions.map((value: string | number) => ({
                  value: String(value),
                  text: String(value),
                }))}
                disabled={studentInLockoutFlow}
                size="m"
                dropdownTextThickness="thin"
                className={classNames(styles.input, {
                  [styles.lockedOut]: studentInLockoutFlow,
                })}
              />
              {studentInLockoutFlow && (
                <span className={styles.lockedOutHelperMessage}>
                  {i18n.accountInformationUpdateFieldParentPermissionRequired()}
                </span>
              )}

              {/* student gender */}
              {showGenderInput && (
                <TextField
                  className={styles.input}
                  label={i18n.accountInformationGender()}
                  onChange={e => setGender(e.target.value)}
                  value={gender}
                  name="user[gender_student_input]"
                  maxLength={50}
                />
              )}

              {/* US state */}
              {isUSA && (
                <>
                  <SimpleDropdown
                    labelText={i18n.accountInformationState()}
                    name="user[us_state]"
                    selectedValue={usState}
                    onChange={e => setUsState(e.target.value)}
                    items={usStateOptions}
                    disabled={studentInLockoutFlow}
                    size="m"
                    dropdownTextThickness="thin"
                    className={classNames(styles.input, {
                      [styles.lockedOut]: studentInLockoutFlow,
                    })}
                  />
                  {studentInLockoutFlow && (
                    <span className={styles.lockedOutHelperMessage}>
                      {i18n.accountInformationUpdateFieldParentPermissionRequired()}
                    </span>
                  )}
                </>
              )}
            </>
          )}
          {Object.keys(errors).length > 0 && (
            <Alert
              text={i18n.accountInformationReviewErrors()}
              type={alertTypes.danger}
              className={styles.alert}
            />
          )}
        </div>
        <div>
          <Button
            className={styles.submit}
            text={i18n.accountInformationUpdateAccountInformation()}
            onClick={handleSubmitAccountSettingsUpdate}
          />
        </div>
      </form>
    </>
  );
};
