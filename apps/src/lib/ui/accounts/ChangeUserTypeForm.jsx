import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import {Field} from '../SystemDialog/SystemDialog';

export default class ChangeUserTypeForm extends React.Component {
  static propTypes = {
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

  render() {
    const {values, validationErrors, disabled} = this.props;
    return (
      <div>
        <p>
          {i18n.changeUserTypeModal_description_toTeacher()}
        </p>
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
      </div>
    );
  }
}

const styles = {
  input: {
    marginBottom: 4,
  },
};
