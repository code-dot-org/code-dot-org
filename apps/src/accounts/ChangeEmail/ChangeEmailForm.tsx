import React, {useState} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {pegasus} from '../../lib/util/urlHelpers';

import {ChangeEmailFormProps} from './types';

import styles from './formStyle.module.scss';

export const ChangeEmailForm: React.FC<ChangeEmailFormProps> = ({
  onChange,
  onSubmit,
  values,
  validationErrors,
  disabled,
  userType,
  isPasswordRequired,
}) => {
  const [touched, setTouched] = useState(false);

  const onNewEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    onChange({
      ...values,
      newEmail: event.target.value,
    });
  };

  const onCurrentPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTouched(true);
    onChange({
      ...values,
      currentPassword: event.target.value,
    });
  };

  const onEmailOptInChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    onChange({
      ...values,
      emailOptIn: event.target.value,
    });
  };

  const submitOnEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !disabled) {
      onSubmit();
    }
  };

  return (
    <form className={styles.form}>
      <TextField
        inputType="email"
        name="user[email]"
        label={i18n.changeEmailModal_newEmail_label()}
        errorMessage={touched ? validationErrors.newEmail : undefined}
        onChange={onNewEmailChange}
        onKeyDown={submitOnEnter}
        autoComplete="off"
        maxLength={255}
        value={values.newEmail}
        disabled={disabled}
      />
      {isPasswordRequired && (
        <TextField
          inputType="password"
          name="user[current_password]"
          label={i18n.changeEmailModal_currentPassword_label()}
          errorMessage={touched ? validationErrors.currentPassword : undefined}
          onChange={onCurrentPasswordChange}
          onKeyDown={submitOnEnter}
          maxLength={255}
          value={values.currentPassword}
          disabled={disabled}
        />
      )}
      {userType === UserTypes.TEACHER && (
        <div>
          <Typography semanticTag="span" visualAppearance="body-three">
            {i18n.changeEmailModal_emailOptIn_description()}{' '}
            <Link
              text={i18n.changeEmailModal_emailOptIn_privacyPolicy()}
              href={pegasus('/privacy')}
              openInNewTab={true}
              external={true}
              size="s"
            />
          </Typography>
          <div className={styles.radioContainer}>
            <RadioButtonsGroup
              onChange={onEmailOptInChange}
              radioButtons={[
                {
                  name: 'email-opt-in',
                  value: 'yes',
                  label: i18n.yes(),
                  size: 'xs',
                  disabled,
                },
                {
                  name: 'email-opt-out',
                  value: 'no',
                  label: i18n.no(),
                  size: 'xs',
                  disabled,
                },
              ]}
            />
            {touched && validationErrors.emailOptIn && (
              <div className={styles.errorMessage}>
                <FontAwesomeV6Icon iconName={'circle-exclamation'} />
                <span>{validationErrors.emailOptIn}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};
