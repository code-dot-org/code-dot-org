import Link from '@code-dot-org/component-library/link';
import Modal from '@code-dot-org/component-library/modal';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {pegasus} from '../lib/util/urlHelpers';
import {isEmail} from '../util/formatValidation';

import styles from './add-parent-email-modal.module.scss';

const STATE_INITIAL = 'initial';
const STATE_SAVING = 'saving';
const STATE_UNKNOWN_ERROR = 'unknown-error';

const PARENT_EMAIL_SELECTOR = 'input[name="parentEmail"]';

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
    currentParentEmail: PropTypes.string,
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
        parentEmailOptIn: '',
      },
      errors: {
        parentEmail: '',
        confirmedParentEmail: '',
      },
    };
  }

  // The DSCO TextField is a function component and does not forward a ref to
  // its <input>, so we reach the parent-email node by its name attribute
  // through the modal content root (not by field order). A content-scoped
  // querySelector keeps focus working under enzyme's detached mount.
  focusOnError() {
    const {errors} = this.state;
    if (errors.parentEmail) {
      const emailInput =
        this.content && this.content.querySelector(PARENT_EMAIL_SELECTOR);
      emailInput && emailInput.focus();
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

  // Submit on Enter from either email field; save() no-ops when invalid.
  onKeyDown = event => {
    if (event.key === 'Enter') {
      this.save();
    }
  };

  // The DSCO Modal close affordances (X button, Esc) route here; ignore them
  // while a save is in flight, matching the old BaseDialog `uncloseable` prop.
  handleClose = () => {
    if (this.state.saveState !== STATE_SAVING) {
      this.cancel();
    }
  };

  onSubmitFailure = error => {
    if (error && Object.prototype.hasOwnProperty.call(error, 'serverErrors')) {
      this.setState(
        {
          saveState: STATE_INITIAL,
          errors: error.serverErrors,
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
        errors.confirmedParentEmail || this.getConfirmedEmailValidationError(),
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
      <Modal
        title={i18n.addParentEmailModal_title()}
        description={i18n.addParentEmailModal_subtitle()}
        onClose={this.handleClose}
        closeLabel={i18n.closeDialog()}
        customContent={
          <div ref={el => (this.content = el)} className={styles.form}>
            <TextField
              name="parentEmail"
              inputType="email"
              label={i18n.addParentEmailModal_parentEmail_label()}
              errorMessage={validationErrors.parentEmail}
              value={values.parentEmail}
              onChange={this.onParentEmailChange}
              onKeyDown={this.onKeyDown}
              disabled={saving}
              autoComplete="off"
              maxLength={255}
            />
            <TextField
              name="confirmedParentEmail"
              inputType="email"
              label={i18n.addParentEmailModal_confirmedParentEmail_label()}
              errorMessage={validationErrors.confirmedParentEmail}
              value={values.confirmedParentEmail}
              onChange={this.onConfirmedParentEmailChange}
              onKeyDown={this.onKeyDown}
              disabled={saving}
              autoComplete="off"
              maxLength={255}
            />
            <fieldset className={styles.optInSection}>
              <div className={styles.optInHeading}>
                <MuiTypography variant="body2" component="div">
                  <strong>{i18n.addParentEmailModal_emailOptIn_label()}</strong>
                </MuiTypography>
                <MuiTypography variant="body3" component="div">
                  {i18n.addParentEmailModal_emailOptIn_sublabel()}
                </MuiTypography>
              </div>
              <div className={styles.optInBody}>
                <MuiTypography
                  variant="body2"
                  component="div"
                  className={styles.optInDescription}
                >
                  {i18n.addParentEmailModal_emailOptIn_description()}{' '}
                  <Link href={pegasus('/privacy')} openInNewTab>
                    {i18n.changeEmailModal_emailOptIn_privacyPolicy()}
                  </Link>
                </MuiTypography>
                <div className={styles.radioGroup}>
                  <RadioButton
                    name="parentEmailOptIn"
                    value="yes"
                    label={i18n.yes()}
                    checked={values.parentEmailOptIn === 'yes'}
                    onChange={this.onEmailOptInChange}
                    disabled={saving}
                  />
                  <RadioButton
                    name="parentEmailOptIn"
                    value="no"
                    label={i18n.no()}
                    checked={values.parentEmailOptIn === 'no'}
                    onChange={this.onEmailOptInChange}
                    disabled={saving}
                  />
                </div>
              </div>
            </fieldset>
          </div>
        }
        primaryButtonProps={{
          children: i18n.addParentEmailModal_save(),
          onClick: this.save,
          disabled: saving || !isFormValid,
        }}
        secondaryButtonProps={{
          children: i18n.cancel(),
          onClick: this.cancel,
          disabled: saving,
        }}
        customBottomContent={
          (saving || STATE_UNKNOWN_ERROR === saveState) && (
            <div className={styles.status}>
              {saving && <em>{i18n.saving()}</em>}
              {STATE_UNKNOWN_ERROR === saveState && (
                <em>{i18n.changeEmailModal_unexpectedError()}</em>
              )}
            </div>
          )
        }
      />
    );
  };
}
