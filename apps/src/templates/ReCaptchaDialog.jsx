import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from './Button';
import BaseDialog from './BaseDialog';
import Spinner from '../code-studio/pd/components/spinner';

const styles = {
  dialog: {
    padding: '20px'
  }
};

export default class ReCaptchaDialog extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      disableSubmitButton: true,
      loadedCaptcha: false
    };
    this.onCaptchaVerification = this.onCaptchaVerification.bind(this);
    this.handleClose = this.handleClose.bind(this);
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

  // TODO: you need to send this token to the backend to validate it
  onCaptchaVerification(token) {
    this.setState({disableSubmitButton: false});
  }

  componentWillUnmount() {
    const captchaScript = document.getElementById('captcha');
    captchaScript.remove();
  }

  onCaptchaExpiration() {
    this.setState({disableSubmitButton: true});
  }

  handleClose() {
    this.props.handleClose();
    this.props.joinSection();
  }

  render() {
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          fixedWidth={600}
          uncloseable={true}
          style={styles.dialog}
          handleClose={this.props.handleClose}
          isOpen={this.props.isOpen}
        >
          <h3>
            {`Are you a bot?
            }`}
          </h3>
          <hr />
          {!this.state.loadedCaptcha && <Spinner size="large" />}
          {this.state.loadedCaptcha && (
            <div
              className="g-recaptcha"
              data-sitekey="SECRET"
              data-callback="onSubmit"
              data-expired-callback="captchaExpired"
            />
          )}
          <hr />
          <Button
            onClick={this.handleClose}
            color={Button.ButtonColor.orange}
            text={i18n.joinSection()}
            style={styles.buttonStyle}
            disabled={this.state.disableSubmitButton}
          />
        </BaseDialog>
      </div>
    );
  }
}