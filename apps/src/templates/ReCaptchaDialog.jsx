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

export default class ReCaptchaValidationDialog extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      disableSubmitButton: true,
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
    window.onSubmit = token => this.onCaptchaVerification(token);
    window.captchaExpired = () => this.onCaptchaExpiration();
    script.onload = () => this.setState({loadedCaptcha: true});
    document.body.appendChild(script);
  }

  onCaptchaVerification(token) {
    this.setState({disableSubmitButton: false});
    this.token = token;
  }

  componentWillUnmount() {
    const captchaScript = document.getElementById('captcha');
    captchaScript.remove();
  }

  onCaptchaExpiration() {
    this.setState({disableSubmitButton: true});
  }

  // function passed as props must then send token to the Rails backend immediately
  // for verification.
  // Must submit a POST request per documentation here: https://developers.google.com/recaptcha/docs/verify
  handleSubmit() {
    this.props.handleSubmit(this.token);
  }

  render() {
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          fixedWidth={600}
          uncloseable={true}
          style={styles.dialog}
          isOpen={this.props.isOpen}
        >
          <h3>{i18n.verifyNotBot()}</h3>
          {!this.state.loadedCaptcha && <Spinner size="large" />}
          {this.state.loadedCaptcha && (
            <div
              className="g-recaptcha"
              //TODO: you need to figure out how to set up a config for the correct API keys
              data-sitekey="SECRET"
              data-callback="onSubmit"
              data-expired-callback="captchaExpired"
            />
          )}
          <DialogFooter>
            <Button
              onClick={this.props.handleCancel}
              text={i18n.dialogCancel()}
              color={Button.ButtonColor.gray}
              className="no-mc"
            />
            <Button
              text={i18n.joinSection()}
              onClick={this.handleSubmit}
              color={Button.ButtonColor.orange}
              className="no-mc ui-confirm-project-delete-button"
              disabled={this.state.disableSubmitButton}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}
