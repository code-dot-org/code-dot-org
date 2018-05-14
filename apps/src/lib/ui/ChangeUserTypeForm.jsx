import React, {PropTypes} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {createUuid} from "../../utils";

const TEACHER = 'teacher';
const STUDENT = 'student';

export default class ChangeUserTypeForm extends React.Component {
  static propTypes = {
    // The desired user type _after_ submitting the form.
    targetUserType: PropTypes.oneOf([TEACHER, STUDENT]).isRequired,
    userHasPassword: PropTypes.bool.isRequired,
    values: PropTypes.shape({
      currentEmail: PropTypes.string,
      currentPassword: PropTypes.string,
    }).isRequired,
    validationErrors: PropTypes.shape({
      currentEmail: PropTypes.string,
      currentPassword: PropTypes.string,
    }).isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const firstInput = [
      this.currentEmailInput,
      this.currentPasswordInput,
    ].filter(x => x)[0];
    firstInput.focus();
  }

  focusOnAnError() {
    const {validationErrors} = this.props;
    if (validationErrors.currentEmail) {
      this.currentEmailInput.focus();
    } else if (validationErrors.currentPassword) {
      this.currentPasswordInput.focus();
    }
  }

  onCurrentEmailChange = (event) => this.props.onChange({
    ...this.props.values,
    currentEmail: event.target.value,
  });

  onCurrentPasswordChange = (event) => this.props.onChange({
    ...this.props.values,
    currentPassword: event.target.value,
  });

  onKeyDown = (event) => {
    if (event.key === 'Enter' && !this.props.disabled) {
      this.props.onSubmit();
    }
  };

  renderDescription() {
    const {targetUserType} = this.props;
    return (
      <p>
        {STUDENT === targetUserType && i18n.changeUserTypeModal_description_toStudent()}
        {TEACHER === targetUserType && i18n.changeUserTypeModal_description_toTeacher()}
      </p>
    );
  }

  render() {
    const {targetUserType, userHasPassword, values, validationErrors, disabled} = this.props;
    return (
      <div>
        {this.renderDescription()}
        {TEACHER === targetUserType &&
          <Field
            label={i18n.changeUserTypeModal_currentEmail_label()}
            labelDetails={i18n.changeUserTypeModal_currentEmail_labelDetails()}
            error={validationErrors.currentEmail}
          >
            <input
              type="email"
              value={values.currentEmail}
              disabled={disabled}
              onKeyDown={this.onKeyDown}
              onChange={this.onCurrentEmailChange}
              autoComplete="off"
              maxLength="255"
              size="255"
              style={styles.input}
              ref={el => this.currentEmailInput = el}
            />
          </Field>
        }
        {userHasPassword &&
          <Field
            label={i18n.changeUserTypeModal_currentPassword_label()}
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
        }
      </div>
    );
  }
}

class Field extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    labelDetails: PropTypes.string,
    error: PropTypes.any,
    children: PropTypes.element.isRequired,
    style: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.uniqueId = createUuid();
  }

  render() {
    const {label, labelDetails, error, children, style} = this.props;
    return (
      <div
        style={{
          marginBottom: 15,
          ...style,
        }}
      >
        {(label || labelDetails) &&
          <label
            htmlFor={this.uniqueId}
            style={{
              display: 'block',
              color: color.charcoal,
            }}
          >
            {label &&
              <span style={{fontWeight: 'bold', marginRight: '1em'}}>
                {label}
              </span>
            }
            {labelDetails &&
              <span>
                {labelDetails}
              </span>
            }
          </label>
        }
        {React.cloneElement(children, {id: this.uniqueId})}
        {error &&
          <FieldError>
            {error}
          </FieldError>
        }
      </div>
    );
  }
}

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
  input: {
    marginBottom: 4,
  },
};
