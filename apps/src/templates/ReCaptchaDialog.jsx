import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from './Button';
import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';
import Spinner from '../code-studio/pd/components/spinner';

/*
Note that the version of reCAPTCHA supported by this dialog (v2 - I am not a robot)
can be difficult for young users to solve. Thus, it should be used sparingly across the site.
*/
export default class ReCaptchaDialog extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func,
    isOpen: PropTypes.bool.isRequired,
    submitText: PropTypes.string,
    siteKey: PropTypes.string.isRequired,
    body: PropTypes.node,
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
    this.mountCaptcha();
  }

  // The dialog is not fully unmounted when isOpen is set to false
  // (but the captcha is removed from the DOM),
  // so we need to force re-rerender the captcha when we open the dialog.
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen && !this.props.isOpen) {
      this.unmountCaptcha();
    }
    if (!prevProps.isOpen && this.props.isOpen) {
      this.mountCaptcha();
    }
  }

  componentWillUnmount() {
    this.unmountCaptcha();
  }

  mountCaptcha() {
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

  unmountCaptcha() {
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
    const {siteKey, isOpen, handleCancel, body} = this.props;
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          fixedWidth={600}
          handleClose={handleCancel}
          style={styles.dialog}
          isOpen={isOpen}
        >
          <h3>Please confirm you're human</h3>
          {body}
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
              text={'Submit'}
              onClick={this.handleSubmit}
              color={Button.ButtonColor.orange}
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
