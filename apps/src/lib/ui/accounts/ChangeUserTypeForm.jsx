import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import {pegasus} from '../../../lib/util/urlHelpers';
import {Field} from '../SystemDialog/SystemDialog';

export default class ChangeUserTypeForm extends React.Component {
  static propTypes = {
    values: PropTypes.shape({
      currentEmail: PropTypes.string,
      emailOptIn: PropTypes.string,
    }).isRequired,
    validationErrors: PropTypes.shape({
      currentEmail: PropTypes.string,
      emailOptIn: PropTypes.string,
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

  onEmailOptInChange = (event) => this.props.onChange({
    ...this.props.values,
    emailOptIn: event.target.value,
  });

  onKeyDown = (event) => {
    if (event.key === 'Enter' && !this.props.disabled) {
      this.props.onSubmit();
    }
  };

  emailOptInLabelDetails() {
    return (
      <span>
        {i18n.changeUserTypeModal_emailOptIn_description()}
        {' '}
        <a href={pegasus('/privacy')} tabIndex="3" target="_blank">
          {i18n.changeUserTypeModal_emailOptIn_privacyPolicy()}
        </a>
      </span>
    );
  }

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
            tabIndex="1"
            onKeyDown={this.onKeyDown}
            onChange={this.onCurrentEmailChange}
            autoComplete="off"
            maxLength="255"
            size="255"
            style={styles.input}
            ref={el => this.currentEmailInput = el}
          />
        </Field>
        <Field
          labelDetails={this.emailOptInLabelDetails()}
          error={validationErrors.emailOptIn}
        >
          <select
            value={values.emailOptIn}
            disabled={disabled}
            tabIndex="1"
            onKeyDown={this.onKeyDown}
            onChange={this.onEmailOptInChange}
            style={{
              ...styles.input,
              width: 100,
            }}
            ref={el => this.emailOptInSelect = el}
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
