import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '../../../templates/BaseDialog';
import color from '../../../util/color';
import {isEmail} from '../../../util/formatValidation';
import {Field, Header, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';
import {pegasus} from '../../util/urlHelpers';

const STATE_INITIAL = 'initial';
const STATE_SAVING = 'saving';
const STATE_UNKNOWN_ERROR = 'unknown-error';

export default class AddParentEmailModal extends React.Component {
  static propTypes = {
    /**
     * @type {function({parentEmail: string, parentEmailOptIn: string}):Promise}
     */
    handleSubmit: PropTypes.func.isRequired,
    /**
     * @type {function()}
     */
    handleCancel: PropTypes.func.isRequired,
    currentParentEmail: PropTypes.string
  };

  constructor(props) {
    super(props);
    const displayedParentEmail = props.currentParentEmail
      ? props.currentParentEmail
      : '';
    this.state = {
      saveState: STATE_INITIAL,
      values: {
        parentEmail: displayedParentEmail,
        parentEmailOptIn: ''
      },
      errors: {
        parentEmail: '',
        parentEmailOptIn: ''
      }
    };
  }

  focusOnError() {
    const {errors} = this.state;
    if (errors.parentEmail) {
      this.parentEmailInput.focus();
    }
  }

  save = () => {
    // No-op if we know the form is invalid, client-side.
    // This blocks return-key submission when the form is invalid.
    if (!this.isFormValid(this.getValidationErrors())) {
      return;
    }

    const {values} = this.state;
    this.setState({saveState: STATE_SAVING});
    this.props.handleSubmit(values).catch(this.onSubmitFailure);
  };

  cancel = () => this.props.handleCancel();

  onSubmitFailure = error => {
    if (error && error.hasOwnProperty('serverErrors')) {
      this.setState(
        {
          saveState: STATE_INITIAL,
          errors: error.serverErrors
        },
        () => this.focusOnError()
      );
    } else {
      this.setState({saveState: STATE_UNKNOWN_ERROR});
    }
  };

  isFormValid(errors) {
    return Object.keys(errors).every(key => !errors[key]);
  }

  getValidationErrors() {
    const {errors} = this.state;
    return {
      parentEmail: errors.parentEmail || this.getNewEmailValidationError(),
      parentEmailOptIn:
        errors.parentEmailOptIn || this.getEmailOptInValidationError()
    };
  }

  getNewEmailValidationError = () => {
    const {parentEmail} = this.state.values;
    if (parentEmail.trim().length === 0) {
      return i18n.addParentEmailModal_parentEmail_isRequired();
    }
    if (!isEmail(parentEmail.trim())) {
      return i18n.addParentEmailModal_parentEmail_invalid();
    }
    if (parentEmail.trim() === this.props.currentParentEmail) {
      return i18n.addParentEmailModal_parentEmail_mustBeDifferent();
    }
    return null;
  };

  getEmailOptInValidationError = () => {
    const {parentEmailOptIn} = this.state.values;
    if (parentEmailOptIn.length === 0) {
      return i18n.addParentEmailModal_emailOptIn_isRequired();
    }
    return null;
  };

  onParentEmailChange = event => {
    const {values, errors} = this.state;
    values['parentEmail'] = event.target.value;
    errors['parentEmail'] = '';
    this.setState({values, errors});
  };

  onEmailOptInChange = event => {
    const {values, errors} = this.state;
    values['parentEmailOptIn'] = event.target.value;
    errors['parentEmailOptIn'] = '';
    this.setState({values, errors});
  };

  render = () => {
    const {saveState, values} = this.state;
    const validationErrors = this.getValidationErrors();
    const isFormValid = this.isFormValid(validationErrors);
    const saving = saveState === STATE_SAVING;
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen
        handleClose={this.cancel}
        uncloseable={STATE_SAVING === saveState}
      >
        <div style={styles.container}>
          <Header text={i18n.addParentEmailModal_title()} />
          <Field
            label={i18n.addParentEmailModal_parentEmail_label()}
            error={validationErrors.parentEmail}
          >
            <input
              type="email"
              value={values.parentEmail}
              disabled={saving}
              tabIndex="1"
              onKeyDown={this.onKeyDown}
              onChange={this.onParentEmailChange}
              autoComplete="off"
              maxLength="255"
              size="255"
              style={styles.input}
              ref={el => (this.parentEmailInput = el)}
            />
          </Field>
          <Field error={validationErrors.parentEmailOptIn}>
            <div style={styles.parentEmailOptIn}>
              <label style={styles.label}>
                {i18n.addParentEmailModal_emailOptIn_description()}{' '}
                <a href={pegasus('/privacy')}>
                  {i18n.changeEmailModal_emailOptIn_privacyPolicy()}
                </a>
              </label>
              <div>
                <div style={styles.radioButton}>
                  <input
                    type="radio"
                    id="yes"
                    value={'yes'}
                    disabled={saving}
                    checked={values['parentEmailOptIn'] === 'yes'}
                    onChange={this.onEmailOptInChange}
                  />
                  <label htmlFor="yes" style={styles.label}>
                    {i18n.yes()}
                  </label>
                </div>
                <div style={styles.radioButton}>
                  <input
                    type="radio"
                    id="no"
                    value={'no'}
                    disabled={saving}
                    checked={values['parentEmailOptIn'] === 'no'}
                    onChange={this.onEmailOptInChange}
                  />
                  <label htmlFor="no" style={styles.label}>
                    {i18n.no()}
                  </label>
                </div>
              </div>
            </div>
          </Field>
          <ConfirmCancelFooter
            confirmText={i18n.addParentEmailModal_save()}
            onConfirm={this.save}
            onCancel={this.cancel}
            disableConfirm={saving || !isFormValid}
            disableCancel={saving}
            tabIndex="2"
          >
            {saving && <em>{i18n.saving()}</em>}
            {STATE_UNKNOWN_ERROR === saveState && (
              <em>{i18n.changeEmailModal_unexpectedError()}</em>
            )}
          </ConfirmCancelFooter>
        </div>
      </BaseDialog>
    );
  };
}

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  parentEmailOptIn: {
    display: 'flex',
    flexDirection: 'row'
  },
  radioButton: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  label: {
    margin: 'auto'
  }
};
