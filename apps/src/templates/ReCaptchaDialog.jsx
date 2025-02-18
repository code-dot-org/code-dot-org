import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import Spinner from '../sharedComponents/Spinner';

import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';

/*
Note that the version of reCAPTCHA supported by this dialog (v2 - I am not a robot)
can be difficult for young users to solve. Thus, it should be used sparingly across the site.
*/
export default class ReCaptchaDialog extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    submitText: PropTypes.string.isRequired,
    siteKey: PropTypes.string.isRequired,
    title: PropTypes.string,
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      submitButtonEnabled: false,
      loadedCaptcha: false,
    };
    this.token = '';
    this.onCaptchaVerification = this.onCaptchaVerification.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onCaptchaExpiration = this.onCaptchaExpiration.bind(this);
  }

  componentDidMount() {
    this.loadCaptcha();
  }

  // The dialog is not fully unmounted when isOpen is set to false,
  // but the captcha is removed from the DOM.
  // Thus, we need to force re-render the captcha each time the dialog is opened.
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen && !this.props.isOpen) {
      this.setState({submitButtonEnabled: false});
      this.cleanUpCaptcha();
    }
    if (!prevProps.isOpen && this.props.isOpen) {
      this.loadCaptcha();
    }
  }

  componentWillUnmount() {
    this.cleanUpCaptcha();
  }

  loadCaptcha() {
    //Add reCaptcha and associated callbacks.
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.id = 'captcha';
    script.async = true;
    script.defer = true;
    window.onCaptchaSubmit = token => this.onCaptchaVerification(token);
    window.onCaptchaExpired = () => this.onCaptchaExpiration();
    script.onload = () => this.setState({loadedCaptcha: true});
    document.body.appendChild(script);
  }

  cleanUpCaptcha() {
    const captchaScript = document.getElementById('captcha');
    if (captchaScript) {
      captchaScript.remove();
    }
  }

  onCaptchaVerification(token) {
    this.setState({submitButtonEnabled: true});
    this.token = token;
  }

  onCaptchaExpiration() {
    this.setState({submitButtonEnabled: false});
  }

  // Function passed as props must then send token to the Rails backend immediately
  // for verification.
  // Must submit a POST request per documentation here: https://developers.google.com/recaptcha/docs/verify
  handleSubmit() {
    this.props.handleSubmit(this.token);
  }

  render() {
    const {siteKey, isOpen, handleCancel, submitText, title, children} =
      this.props;
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          fixedWidth={600}
          handleClose={handleCancel}
          style={styles.dialog}
          isOpen={isOpen}
        >
          <h3>{title || i18n.verifyNotBot()}</h3>
          {children}
          {!this.state.loadedCaptcha && <Spinner size="large" />}
          {this.state.loadedCaptcha && (
            <div
              className="g-recaptcha"
              data-sitekey={siteKey}
              data-callback="onCaptchaSubmit"
              data-expired-callback="onCaptchaExpired"
            />
          )}
          <DialogFooter>
            <Button
              onClick={handleCancel}
              text={i18n.dialogCancel()}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={submitText}
              onClick={this.handleSubmit}
              color={Button.ButtonColor.brandSecondaryDefault}
              disabled={!this.state.submitButtonEnabled}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
};
