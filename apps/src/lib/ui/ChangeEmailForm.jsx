import React, {PropTypes} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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
    if (event.key === 'Enter') {
      this.props.onSubmit();
    }
  };

  render() {
    const {values, validationErrors, disabled} = this.props;
    return (
      <div>
        <Field>
          <label
            htmlFor="user_email"
            style={styles.label}
          >
            {i18n.changeEmailModal_newEmail_label()}
          </label>
          <input
            id="user_email"
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
          <FieldError>
            {validationErrors.newEmail}
          </FieldError>
        </Field>
        <Field>
          <label
            htmlFor="user_current_password"
            style={styles.label}
          >
            {i18n.changeEmailModal_currentPassword_label()}
          </label>
          <input
            id="user_current_password"
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
          <FieldError>
            {validationErrors.currentPassword}
          </FieldError>
        </Field>
        <Field style={{display: 'none'}}>
          <p>
            {i18n.changeEmailModal_emailOptIn_description()}
          </p>
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
          <FieldError>
            {validationErrors.emailOptIn}
          </FieldError>
        </Field>
      </div>
    );
  }
}

const Field = ({children, style}) => (
  <div
    style={{
      marginBottom: 15,
      ...style,
    }}
  >
    {children}
  </div>
);
Field.propTypes = {
  children: PropTypes.any,
  style: PropTypes.object,
};

const FieldError = ({children}) => (
  <div
    style={{
      color: color.red,
      fontStyle: 'italic',
    }}
  >
    {children}
  </div>
);
FieldError.propTypes = {children: PropTypes.string};

const styles = {
  label: {
    display: 'block',
    fontWeight: 'bold',
    color: color.charcoal,
  },
  input: {
    marginBottom: 4,
  },
};
