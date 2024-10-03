import PropTypes from 'prop-types';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import i18n from '@cdo/locale';

import {pegasus} from '../../lib/util/urlHelpers';

import styles from './formStyle.module.scss';

export default class ChangeEmailForm extends React.Component {
  static propTypes = {
    values: PropTypes.shape({
      newEmail: PropTypes.string,
      currentPassword: PropTypes.string,
      emailOptIn: PropTypes.string,
    }).isRequired,
    validationErrors: PropTypes.shape({
      newEmail: PropTypes.string,
      currentPassword: PropTypes.string,
      emailOptIn: PropTypes.string,
    }).isRequired,
    userType: PropTypes.oneOf(['teacher', 'student']).isRequired,
    isPasswordRequired: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  };

  state = {touched: false};

  onNewEmailChange = event => {
    this.setState({touched: true});
    this.props.onChange({
      ...this.props.values,
      newEmail: event.target.value,
    });
  };

  onCurrentPasswordChange = event => {
    this.setState({touched: true});
    this.props.onChange({
      ...this.props.values,
      currentPassword: event.target.value,
    });
  };

  onEmailOptInChange = event => {
    this.setState({touched: true});
    this.props.onChange({
      ...this.props.values,
      emailOptIn: event.target.value,
    });
  };

  render() {
    const {values, validationErrors, disabled, userType, isPasswordRequired} =
      this.props;
    return (
      <form className={styles.form}>
        <TextField
          inputType="email"
          label={i18n.changeEmailModal_newEmail_label()}
          errorMessage={
            this.state.touched ? validationErrors.newEmail : undefined
          }
          onChange={this.onNewEmailChange}
          autoComplete="off"
          maxLength={255}
          value={values.newEmail}
          disabled={disabled}
        />
        {isPasswordRequired && (
          <TextField
            inputType="password"
            label={i18n.changeEmailModal_currentPassword_label()}
            errorMessage={
              this.state.touched ? validationErrors.currentPassword : undefined
            }
            onChange={this.onCurrentPasswordChange}
            maxLength={255}
            value={values.currentPassword}
            disabled={disabled}
          />
        )}
        {userType === 'teacher' && (
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
                onChange={this.onEmailOptInChange}
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
              {this.state.touched && validationErrors.emailOptIn && (
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
  }
}
