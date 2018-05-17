import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import {Field} from './SystemDialog/SystemDialog';

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
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.newEmailInput.focus();
  }

  focusOnAnError() {
    const {validationErrors} = this.props;
    if (validationErrors.newEmail) {
      this.newEmailInput.focus();
    } else if (validationErrors.currentPassword) {
      this.currentPasswordInput.focus();
    }
  }

  onNewEmailChange = (event) => this.props.onChange({
    ...this.props.values,
    newEmail: event.target.value,
  });

  onCurrentPasswordChange = (event) => this.props.onChange({
    ...this.props.values,
    currentPassword: event.target.value,
  });

  onEmailOptInChange = (event) => this.props.onChange({
    ...this.props.values,
    emailOptIn: event.target.value,
  });

  onKeyDown = (event) => {
    if (event.key === 'Enter' && !this.props.disabled) {
      this.props.onSubmit();
    }
  };

  render() {
    const {values, validationErrors, disabled} = this.props;
    return (
      <div>
        <Field
          label={i18n.changeEmailModal_newEmail_label()}
          error={validationErrors.newEmail}
        >
          <input
            type="email"
            value={values.newEmail}
            disabled={disabled}
            onKeyDown={this.onKeyDown}
            onChange={this.onNewEmailChange}
            autoComplete="off"
            maxLength="255"
            size="255"
            style={styles.input}
            ref={el => this.newEmailInput = el}
          />
        </Field>
        <Field
          label={i18n.changeEmailModal_currentPassword_label()}
          error={validationErrors.currentPassword}
        >
          <input
            type="password"
            value={values.currentPassword}
            disabled={disabled}
            onKeyDown={this.onKeyDown}
            onChange={this.onCurrentPasswordChange}
            maxLength="255"
            size="255"
            style={styles.input}
            ref={el => this.currentPasswordInput = el}
          />
        </Field>
        <Field
          label={i18n.changeEmailModal_emailOptIn_description()}
          error={validationErrors.emailOptIn}
          style={{display: 'none'}}
        >
          <select
            value={values.emailOptIn}
            onKeyDown={this.onKeyDown}
            onChange={this.onEmailOptInChange}
            disabled={disabled}
            style={{
              ...styles.input,
              width: 100,
            }}
          >
            <option value=""/>
            <option value="yes">
              {i18n.yes()}
            </option>
            <option value="no">
              {i18n.no()}
            </option>
          </select>
        </Field>
      </div>
    );
  }
}

const styles = {
  input: {
    marginBottom: 4,
  },
};
