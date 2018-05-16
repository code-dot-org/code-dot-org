import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import {Field} from '../SystemDialog/SystemDialog';

const TEACHER = 'teacher';
const STUDENT = 'student';

export default class ChangeUserTypeForm extends React.Component {
  static propTypes = {
    // The desired user type _after_ submitting the form.
    targetUserType: PropTypes.oneOf([TEACHER, STUDENT]).isRequired,
    values: PropTypes.shape({
      currentEmail: PropTypes.string,
    }).isRequired,
    validationErrors: PropTypes.shape({
      currentEmail: PropTypes.string,
    }).isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const firstInput = [
      this.currentEmailInput,
    ].filter(x => x)[0];
    firstInput && firstInput.focus();
  }

  focusOnAnError() {
    const {validationErrors} = this.props;
    if (validationErrors.currentEmail) {
      this.currentEmailInput.focus();
    }
  }

  onCurrentEmailChange = (event) => this.props.onChange({
    ...this.props.values,
    currentEmail: event.target.value,
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
    const {targetUserType, values, validationErrors, disabled} = this.props;
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
      </div>
    );
  }
}

const styles = {
  input: {
    marginBottom: 4,
  },
};
