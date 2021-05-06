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
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    submitText: PropTypes.string.isRequired,
    siteKey: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      submitButtonEnabled: false,
      loadedCaptcha: false
    };
    this.token = '';
    this.onCaptchaVerification = this.onCaptchaVerification.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onCaptchaExpiration = this.onCaptchaExpiration.bind(this);
  }

  componentDidMount() {
    //Add reCaptcha and associated callbacks.
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.id = 'captcha';
    window.onCaptchaSubmit = token => this.onCaptchaVerification(token);
    window.onCaptchaExpired = () => this.onCaptchaExpiration();
    script.onload = () => this.setState({loadedCaptcha: true});
    document.body.appendChild(script);
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

  // Function passed as props must then send token to the Rails backend immediately
  // for verification.
  // Must submit a POST request per documentation here: https://developers.google.com/recaptcha/docs/verify
  handleSubmit() {
    this.props.handleSubmit(this.token);
  }

  render() {
    const {siteKey, isOpen, handleCancel, submitText} = this.props;
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
    paddingBottom: 20
  }
};
