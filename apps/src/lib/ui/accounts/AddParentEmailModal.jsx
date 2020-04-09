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
        confirmedParentEmail: '',
        parentEmailOptIn: ''
      },
      errors: {
        parentEmail: '',
        confirmedParentEmail: ''
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
      confirmedParentEmail:
        errors.confirmedParentEmail || this.getConfirmedEmailValidationError()
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

  getConfirmedEmailValidationError = () => {
    const {parentEmail, confirmedParentEmail} = this.state.values;
    if (parentEmail !== confirmedParentEmail) {
      return i18n.addParentEmailModal_confirmedParentEmail_mustMatch();
    }
    return null;
  };

  onParentEmailChange = event => {
    const {values, errors} = this.state;
    values['parentEmail'] = event.target.value;
    errors['parentEmail'] = '';
    this.setState({values, errors});
  };

  onConfirmedParentEmailChange = event => {
    const {values, errors} = this.state;
    values['confirmedParentEmail'] = event.target.value;
    errors['confirmedParentEmail'] = '';
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
          <div>
            <Header text={i18n.addParentEmailModal_title()} hideBorder={true} />
            {i18n.addParentEmailModal_subtitle()}
            <hr />
          </div>
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
          <Field
            label={i18n.addParentEmailModal_confirmedParentEmail_label()}
            error={validationErrors.confirmedParentEmail}
          >
            <input
              type="email"
              value={values.confirmedParentEmail}
              disabled={saving}
              tabIndex="1"
              onKeyDown={this.onKeyDown}
              onChange={this.onConfirmedParentEmailChange}
              autoComplete="off"
              maxLength="255"
              size="255"
              style={styles.input}
              ref={el => (this.confirmedParentEmailInput = el)}
            />
          </Field>
          <div style={styles.parentOptInSection}>
            <div style={styles.parentEmailOptInHeading}>
              <b>{i18n.addParentEmailModal_emailOptIn_label()}</b>
              <br /> {i18n.addParentEmailModal_emailOptIn_sublabel()}
            </div>
            <div style={styles.parentEmailOptInInput}>
              <label style={styles.label}>
                {i18n.addParentEmailModal_emailOptIn_description()}{' '}
                <a href={pegasus('/privacy')}>
                  {i18n.changeEmailModal_emailOptIn_privacyPolicy()}
                </a>
              </label>
              <div style={styles.radioSelectors}>
                <div style={styles.radioButton}>
                  <input
                    type="radio"
                    id="yes"
                    value={'yes'}
                    disabled={saving}
                    checked={values['parentEmailOptIn'] === 'yes'}
                    onChange={this.onEmailOptInChange}
                    style={styles.radio}
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
                    style={styles.radio}
                  />
                  <label htmlFor="no" style={styles.label}>
                    {i18n.no()}
                  </label>
                </div>
              </div>
            </div>
          </div>
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
  parentOptInSection: {
    border: '1px solid',
    borderColor: color.charcoal,
    backgroundColor: color.background_gray,
    padding: '10px'
  },
  parentEmailOptInHeading: {
    borderColor: color.charcoal,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    paddingBottom: 10
  },
  parentEmailOptInInput: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 10
  },
  radioSelectors: {
    paddingLeft: 10,
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  radioButton: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  label: {
    margin: 'auto'
  },
  radio: {
    height: 12,
    width: 12,
    margin: 4
  }
};
