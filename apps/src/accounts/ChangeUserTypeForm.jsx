import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {pegasus} from '../lib/util/urlHelpers';

import styles from './change-user-type-form.module.scss';

const EMAIL_INPUT_SELECTOR = 'input[type="email"]';

export default class ChangeUserTypeForm extends React.Component {
  static propTypes = {
    values: PropTypes.shape({
      email: PropTypes.string,
      emailOptIn: PropTypes.string,
    }).isRequired,
    validationErrors: PropTypes.shape({
      email: PropTypes.string,
      emailOptIn: PropTypes.string,
    }).isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.focusEmailInput();
  }

  // The DSCO TextField is a function component and does not forward a ref to
  // its <input>, so we reach the node through the form's root element. Using a
  // root-scoped querySelector (rather than getElementById) keeps focus working
  // under enzyme's detached mount.
  focusEmailInput() {
    const emailInput =
      this.root && this.root.querySelector(EMAIL_INPUT_SELECTOR);
    emailInput && emailInput.focus();
  }

  focusOnAnError() {
    if (this.props.validationErrors.email) {
      this.focusEmailInput();
    }
  }

  onEmailChange = event =>
    this.props.onChange({
      ...this.props.values,
      email: event.target.value,
    });

  onEmailOptInChange = event =>
    this.props.onChange({
      ...this.props.values,
      emailOptIn: event.target.value,
    });

  onKeyDown = event => {
    if (event.key === 'Enter' && !this.props.disabled) {
      this.props.onSubmit();
    }
  };

  render() {
    const {values, validationErrors, disabled} = this.props;
    return (
      <div ref={el => (this.root = el)} className={styles.form}>
        <TextField
          name="email"
          inputType="email"
          label={i18n.changeUserTypeModal_email_label()}
          helperMessage={i18n.changeUserTypeModal_email_labelDetails()}
          errorMessage={validationErrors.email}
          value={values.email || ''}
          onChange={this.onEmailChange}
          onKeyDown={this.onKeyDown}
          disabled={disabled}
          autoComplete="off"
          maxLength={255}
        />
        <div className={styles.optIn}>
          <MuiTypography variant="body2" className={styles.optInDescription}>
            {i18n.changeUserTypeModal_emailOptIn_description()}{' '}
            <Link href={pegasus('/privacy')} openInNewTab>
              {i18n.changeUserTypeModal_emailOptIn_privacyPolicy()}
            </Link>
          </MuiTypography>
          <SimpleDropdown
            name="emailOptIn"
            labelText={i18n.changeUserTypeModal_emailOptIn_description()}
            isLabelVisible={false}
            selectedValue={values.emailOptIn || ''}
            onChange={this.onEmailOptInChange}
            onKeyDown={this.onKeyDown}
            errorMessage={validationErrors.emailOptIn}
            disabled={disabled}
            styleAsFormField
            items={[
              {value: '', text: ''},
              {value: 'yes', text: i18n.yes()},
              {value: 'no', text: i18n.no()},
            ]}
          />
        </div>
      </div>
    );
  }
}
