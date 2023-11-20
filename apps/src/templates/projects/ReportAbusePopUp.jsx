import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import fontConstants from '@cdo/apps/fontConstants';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';
import style from './report-abuse-pop-up.module.scss';
import Button from '@cdo/apps/templates/Button';
import CheckBox from '@cdo/apps/componentLibrary/checkbox';
import {connect} from 'react-redux';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';

const initialCheckboxes = [
  {
    key: 'Cyberbullying',
    label: i18n.abuseTypeCyberbullying(),
    checked: false,
  },
  {
    key: 'Offensive-Content',
    label: i18n.abuseTypeOffensiveCapital(),
    checked: false,
  },
  {
    key: 'Copyright-Infringement',
    label: i18n.abuseTypeInfringement(),
    checked: false,
  },
  {
    key: 'Other',
    label: i18n.abuseTypeOther(),
    checked: false,
  },
];

class UnconnectedReportAbusePopUp extends React.Component {
  static propTypes = {
    projectData: PropTypes.object,
    recaptchaSiteKey: PropTypes.string,
    onClose: PropTypes.func,
    abuseUrl: PropTypes.string,
    onReport: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      showReportConfirmation: false,
      captchaCompleted: false,
      checkboxes: initialCheckboxes,
      showRecaptcha: false,
      loadedCaptcha: false,
    };
    this.cancel = this.cancel.bind(this);
    this.onCaptchaVerification = this.onCaptchaVerification.bind(this);
    this.token = ''; // captcha token
    this.onCaptchaExpiration = this.onCaptchaExpiration.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  componentDidUpdate() {
    const {showRecaptcha, loadedCaptcha} = this.state;

    if (showRecaptcha && !loadedCaptcha) {
      this.createCaptchaScript();
    }

    if (!showRecaptcha && loadedCaptcha) {
      this.cleanUpCaptcha();
    }
  }

  componentWillUnmount() {
    this.cleanUpCaptcha();
  }

  cleanUpCaptcha() {
    const captchaScript = document.getElementById('captcha');
    if (captchaScript) {
      captchaScript.remove();
    }
    this.setState({loadedCaptcha: false});
  }

  cancel() {
    this.props.onClose();
    this.setState({
      captchaCompleted: false, // reset captcha completion
      showRecaptcha: false, // reset checkboxes
      checkboxes: initialCheckboxes,
    });
    this.cleanUpCaptcha();
  }

  onCaptchaVerification(token) {
    this.setState({
      captchaCompleted: true,
    });
    this.token = token;
  }

  handleSubmit() {
    this.sendReportAbuse();
  }

  sendReportAbuse() {
    const formData = new FormData();

    // name, email, age set in controller through current_user
    formData.append(
      'authenticity_token',
      RailsAuthenticityToken.getRailsCSRFMetaTags().token
    );
    formData.append('channel_id', this.props.projectData.channel);
    formData.append('abuse_url', this.props.abuseUrl);
    formData.append('g-recaptcha-response', this.token);

    const checkedCheckboxNames = this.state.checkboxes
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.key.replace(/-/g, ' '));
    formData.append('abuse_type', checkedCheckboxNames);

    fetch('/report_abuse_pop_up', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          this.setState({
            showReportConfirmation: true,
          });
          this.props.onReport();
        } else if (response.status === 403) {
          this.onCaptchaExpiration();
        }
      })
      .catch(error => {
        console.error('Error sending report data:', error);
      });
  }

  onCaptchaExpiration() {
    this.setState({
      captchaCompleted: false,
    });
  }

  handleCheckboxChange = checkboxKey => {
    this.setState(prevState => {
      const updatedCheckboxes = prevState.checkboxes.map(checkbox =>
        checkbox.key === checkboxKey
          ? {...checkbox, checked: !checkbox.checked}
          : checkbox
      );

      const showRecaptcha = updatedCheckboxes.some(
        checkbox => checkbox.checked
      );

      return {
        checkboxes: updatedCheckboxes,
        showRecaptcha,
      };
    });
  };

  createCaptchaScript() {
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

  render() {
    const {
      showRecaptcha,
      checkboxes,
      showReportConfirmation,
      captchaCompleted,
    } = this.state;

    const captchaSiteKey = this.props.recaptchaSiteKey;

    return (
      <AccessibleDialog className={style.popUp} onClose={this.cancel}>
        {showReportConfirmation ? (
          <div className={style.submitConfirmation}>
            <Heading3>{i18n.thankyou()}!</Heading3>
            <BodyTwoText>{i18n.thankYouForReport()}</BodyTwoText>
            <Button
              onClick={this.cancel}
              text={i18n.continue()}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          </div>
        ) : (
          <div>
            <div className={style.title}>
              <Heading3 style={{margin: 0}}>{i18n.reportAbuse()}</Heading3>
              <button
                type="button"
                onClick={this.cancel}
                className={style.xButton}
              >
                <FontAwesome icon="fa-solid fa-xmark" className={style.xIcon} />
              </button>
            </div>
            <hr className={style.lines} />
            <BodyTwoText style={{marginTop: '1rem', marginBottom: '0.5rem'}}>
              {i18n.whyReport()}
            </BodyTwoText>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {checkboxes.map(checkbox => (
                <div
                  key={checkbox.key}
                  style={{marginTop: '0.5rem', marginBottom: '0.5rem'}}
                >
                  <CheckBox
                    label={checkbox.label}
                    checked={checkbox.checked}
                    onChange={() => this.handleCheckboxChange(checkbox.key)}
                    size="m"
                  />
                </div>
              ))}
            </div>
            {showRecaptcha ? (
              <div
                style={{padding: 5}}
                className="g-recaptcha"
                data-sitekey={captchaSiteKey}
                data-callback="onCaptchaSubmit"
                data-expired-callback="onCaptchaExpired"
              />
            ) : null}
            <hr className={style.lines} />
            <div className={style.buttonHolder}>
              <Button
                onClick={this.cancel}
                text={i18n.cancel()}
                color={Button.ButtonColor.neutralDark}
                style={{
                  fontSize: '1rem',
                  ...fontConstants['main-font-regular'],
                }}
              />
              <Button
                onClick={this.handleSubmit}
                disabled={
                  !checkboxes.some(checkbox => checkbox.checked) ||
                  !captchaCompleted
                }
                text={i18n.submit()}
                className={style.submitButton}
                style={{
                  fontSize: '1rem',
                  ...fontConstants['main-font-regular'],
                }}
                color={Button.ButtonColor.brandSecondaryDefault}
              />
            </div>
          </div>
        )}
      </AccessibleDialog>
    );
  }
}

export default connect(state => ({
  recaptchaSiteKey: state.projects.captcha.captchaSiteKey,
}))(UnconnectedReportAbusePopUp);
