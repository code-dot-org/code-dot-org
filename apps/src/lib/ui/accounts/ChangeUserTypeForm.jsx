import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {pegasus} from '../../../lib/util/urlHelpers';
import {Field} from '../SystemDialog/SystemDialog';

export default class ChangeUserTypeForm extends React.Component {
  static propTypes = {
    values: PropTypes.shape({
      email: PropTypes.string,
      emailOptIn: PropTypes.string
    }).isRequired,
    validationErrors: PropTypes.shape({
      email: PropTypes.string,
      emailOptIn: PropTypes.string
    }).isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  componentDidMount() {
    const firstInput = [this.emailInput].filter(x => x)[0];
    firstInput && firstInput.focus();
  }

  focusOnAnError() {
    const {validationErrors} = this.props;
    if (validationErrors.email) {
      this.emailInput.focus();
    }
  }

  onEmailChange = event =>
    this.props.onChange({
      ...this.props.values,
      email: event.target.value
    });

  onEmailOptInChange = event =>
    this.props.onChange({
      ...this.props.values,
      emailOptIn: event.target.value
    });

  onKeyDown = event => {
    if (event.key === 'Enter' && !this.props.disabled) {
      this.props.onSubmit();
    }
  };

  emailOptInLabelDetails() {
    return (
      <span>
        {i18n.changeUserTypeModal_emailOptIn_description()}{' '}
        <a
          href={pegasus('/privacy')}
          tabIndex="3"
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.changeUserTypeModal_emailOptIn_privacyPolicy()}
        </a>
      </span>
    );
  }

  render() {
    const {values, validationErrors, disabled} = this.props;
    return (
      <div>
        <p>{i18n.changeUserTypeModal_description_toTeacher()}</p>
        <Field
          label={i18n.changeUserTypeModal_email_label()}
          labelDetails={i18n.changeUserTypeModal_email_labelDetails()}
          error={validationErrors.email}
        >
          <input
            type="email"
            value={values.email}
            disabled={disabled}
            tabIndex="1"
            onKeyDown={this.onKeyDown}
            onChange={this.onEmailChange}
            autoComplete="off"
            maxLength="255"
            size="255"
            style={styles.input}
            ref={el => (this.emailInput = el)}
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
              width: 100
            }}
            ref={el => (this.emailOptInSelect = el)}
          >
            <option value="" />
            <option value="yes">{i18n.yes()}</option>
            <option value="no">{i18n.no()}</option>
          </select>
        </Field>
      </div>
    );
  }
}

const styles = {
  input: {
    marginBottom: 4
  }
};
