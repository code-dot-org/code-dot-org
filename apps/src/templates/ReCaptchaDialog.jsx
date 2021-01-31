import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from './Button';
import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';
import Spinner from '../code-studio/pd/components/spinner';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

const INITIAL_STATE = {
  submitButtonEnabled: false,
  loadedCaptcha: false
};

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
    siteKey: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {...INITIAL_STATE};
    this.token = '';
    this.onCaptchaVerification = this.onCaptchaVerification.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onCaptchaExpiration = this.onCaptchaExpiration.bind(this);
    this.onCloseCleaup = this.onCloseCleaup.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidUpdate(prevProps) {
    // If the dialog goes from unopen to open, load the script and disable submit button
    if (this.props.isOpen && !prevProps.isOpen) {
      //Add reCaptcha script and associated callbacks.
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.id = 'captcha';
      script.async = true;
      window.onCaptchaSubmit = token => this.onCaptchaVerification(token);
      window.onCaptchaExpired = () => this.onCaptchaExpiration();
      document.head.appendChild(script);
      script.onload = () => {
        this.setState({loadedCaptcha: true});
      };
    }
  }

  componentWillUnmount() {
    const captchaScript = document.getElementById('captcha');
    captchaScript.remove();
  }

  onCaptchaVerification(token) {
    this.setState({submitButtonEnabled: true});
    this.token = token;
  }

  onCaptchaExpiration() {
    this.setState({submitButtonEnabled: false});
  }

  // Clean up the DOM from updates in componentDidUpdate
  onCloseCleaup() {
    //Remove the recaptcha script from DOM if necessary
    const captchaScript = document.getElementById('captcha');
    if (captchaScript) {
      captchaScript.remove();
      delete window['onCaptchaSubmit'];
      delete window['onCaptchaExpired'];
      this.setState({...INITIAL_STATE});
    }
  }

  // Function passed as props must then send token to the Rails backend immediately
  // for verification.
  // Use google_recaptcha_helper.rb on backend to make POST request to google API
  handleSubmit() {
    this.onCloseCleaup();
    this.props.handleSubmit(this.token);
  }

  handleCancel() {
    this.onCloseCleaup();
    this.props.handleCancel();
  }

  render() {
    const {siteKey, isOpen, submitText} = this.props;
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          fixedWidth={600}
          uncloseable={true}
          style={styles.dialog}
          isOpen={isOpen}
        >
          <h3>{i18n.verifyNotBot()}</h3>
          {!this.state.loadedCaptcha && <Spinner size="large" />}
          <div
            className="g-recaptcha"
            data-sitekey={siteKey}
            data-callback="onCaptchaSubmit"
            data-expired-callback="onCaptchaExpired"
          />
          <DialogFooter>
            <Button
              onClick={this.handleCancel}
              text={i18n.dialogCancel()}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={submitText}
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
