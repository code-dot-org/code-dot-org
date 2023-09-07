/* eslint-disable react/jsx-no-target-blank */
import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import getScriptData from '@cdo/apps/util/getScriptData';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';
import style from './project-card.module.scss';
import Button from '@cdo/apps/templates/Button';
import CheckBox from '@cdo/apps/componentLibrary/checkbox/Checkbox.tsx';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

import {UnlocalizedTimeAgo} from '../TimeAgo';

export default class ProjectCard extends React.Component {
  static propTypes = {
    projectData: PropTypes.object.isRequired,
    currentGallery: PropTypes.oneOf(['personal', 'public']).isRequired,
    showFullThumbnail: PropTypes.bool,
    isDetailView: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      showReportAbuse: false,
      showSubmittedHeader: false, // may need to change this state in the future to utilize report cookies - if gallery ever keeps an immediate report
      showSubmitConfirmation: false,
      captchaCompleted: false,
      checkboxes: [
        {name: 'Cyberbullying', checked: false},
        {name: 'Offensive-Content', checked: false},
        {name: 'Copyright-Infringement', checked: false},
        {name: 'Other', checked: false},
      ],
      isAnyCheckboxSelected: false,
      submitButtonEnabled: false,
      loadedCaptcha: false,
    };
    this.showReportAbusePopUp = this.showReportAbusePopUp.bind(this);
    this.cancel = this.cancel.bind(this);
    this.onCaptchaVerification = this.onCaptchaVerification.bind(this);
    this.token = ''; // captcha token
    this.onCaptchaExpiration = this.onCaptchaExpiration.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.abuseUrl = '';
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  showReportAbusePopUp() {
    this.setState({
      showReportAbuse: true,
    });
  }

  componentWillUnmount() {
    const captchaScript = document.getElementById('captcha');
    if (captchaScript) {
      captchaScript.remove();
    }
  }

  cancel() {
    this.setState({
      showReportAbuse: false,
      captchaCompleted: false, // reset captcha completion
      isAnyCheckboxSelected: false, // reset checkboxes
      checkboxes: [
        {name: 'Cyberbullying', checked: false},
        {name: 'Offensive-Content', checked: false},
        {name: 'Copyright-Infringement', checked: false},
        {name: 'Other', checked: false},
      ],
    });
  }

  onCaptchaVerification(token) {
    this.setState({
      submitButtonEnabled: true,
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
    formData.append('abuse_url', this.abuseUrl);
    formData.append('g-recaptcha-response', this.token);

    const checkedCheckboxNames = this.state.checkboxes
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.name);
    formData.append('abuse_type', checkedCheckboxNames);

    fetch('/report_abuse_pop_up', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          this.setState({
            showSubmittedHeader: true,
            showSubmitConfirmation: true,
          });
        } else if (response.status === 403) {
          this.onCaptchaExpiration();
        }
      })
      .catch(error => {
        this.setState({
          submitButtonEnabled: false,
        });
        console.error('Error sending report data:', error);
      });
  }

  onCaptchaExpiration() {
    this.setState({
      submitButtonEnabled: false,
      captchaCompleted: false,
    });
  }

  handleCheckboxChange = checkboxName => {
    this.setState(prevState => {
      const updatedCheckboxes = prevState.checkboxes.map(checkbox =>
        checkbox.name === checkboxName
          ? {...checkbox, checked: !checkbox.checked}
          : checkbox
      );

      const isAnyCheckboxSelected = updatedCheckboxes.some(
        checkbox => checkbox.checked
      );

      return {
        checkboxes: updatedCheckboxes,
        isAnyCheckboxSelected: isAnyCheckboxSelected,
      };
    });
  };

  render() {
    const {projectData, currentGallery, isDetailView} = this.props;
    const {type, channel} = this.props.projectData;
    const isPersonalGallery = currentGallery === 'personal';
    const isPublicGallery = currentGallery === 'public';
    const url = isPersonalGallery
      ? `/projects/${type}/${channel}/edit`
      : `/projects/${type}/${channel}`;
    this.abuseUrl = url;

    const thumbnailStyle = styles.thumbnail;
    if (this.props.showFullThumbnail) {
      Object.assign(thumbnailStyle, styles.fullThumbnail);
    }

    const shouldShowPublicDetails =
      isPublicGallery && isDetailView && projectData.publishedAt;
    const noTimeOnCardStyle = shouldShowPublicDetails ? {} : styles.noTime;

    const {
      showReportAbuse,
      isAnyCheckboxSelected,
      checkboxes,
      showSubmittedHeader,
      submitButtonEnabled,
      showSubmitConfirmation,
    } = this.state;

    const captchaSiteKey = getScriptData('projects').recaptchaSiteKey;

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.id = 'captcha';
    script.async = true;
    script.defer = true;
    window.onCaptchaSubmit = token => this.onCaptchaVerification(token);
    window.onCaptchaExpired = () => this.onCaptchaExpiration();
    script.onload = () => this.setState({loadedCaptcha: true});
    document.body.appendChild(script);

    return (
      <div className="project_card">
        {showReportAbuse ? (
          <AccessibleDialog
            onClose={this.cancel}
            className={style.reportAbusePopUp}
          >
            {showSubmitConfirmation ? (
              <div className={style.submitConfirmation}>
                <h3>Thank you!</h3>
                <p>Thanks for helping us to keep Code.org safe!</p>
                <Button
                  onClick={this.cancel}
                  text={'Continue'}
                  color={Button.ButtonColor.brandSecondaryDefault}
                />
              </div>
            ) : (
              <div>
                <div className={style.popUpTitle}>
                  <h3 style={{margin: 0}}>Report Abuse</h3>
                  <button
                    type="reset"
                    onClick={this.cancel}
                    className={style.xButton}
                  >
                    <FontAwesome icon="x" style={{color: '#D4D5D7'}} />
                  </button>
                </div>
                <hr className={style.popUpLines} />
                <p className={style.popUpBody}>
                  Why are you reporting this content?
                </p>
                <div>
                  {checkboxes.map(checkbox => (
                    <CheckBox
                      key={checkbox.name}
                      label={checkbox.name.replace(/-/g, ' ')}
                      checked={checkbox.checked}
                      onChange={() => this.handleCheckboxChange(checkbox.name)}
                      size="s"
                    />
                  ))}
                </div>
                {isAnyCheckboxSelected ? (
                  <div
                    style={{padding: 5}}
                    className="g-recaptcha"
                    data-sitekey={captchaSiteKey}
                    data-callback="onCaptchaSubmit"
                    data-expired-callback="onCaptchaExpired"
                  />
                ) : null}
                <hr className={style.popUpLines} />
                <div className={style.popUpButtonHolder}>
                  <Button
                    onClick={this.cancel}
                    text={'Cancel'}
                    color={Button.ButtonColor.neutralDark}
                  />
                  <Button
                    onClick={this.handleSubmit}
                    disabled={!submitButtonEnabled}
                    text={'Submit'}
                    style={{outline: 'none'}}
                    color={Button.ButtonColor.brandSecondaryDefault}
                  />
                </div>
              </div>
            )}
          </AccessibleDialog>
        ) : null}

        <div className={style.card}>
          {!showSubmittedHeader ? (
            <div
              style={{
                ...thumbnailStyle,
                ...styles.header,
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={this.showReportAbusePopUp}
                className={style.cautionButton}
              >
                <FontAwesome
                  icon="circle-exclamation"
                  className={style.cautionIcon}
                />
              </button>
            </div>
          ) : (
            <div
              style={{
                ...thumbnailStyle,
                ...styles.header,
                justifyContent: 'center',
              }}
            >
              <p className={style.reported}>Reported</p>
            </div>
          )}

          <div style={thumbnailStyle}>
            <a
              href={studio(url)}
              style={{width: '100%'}}
              target={isPublicGallery ? '_blank' : undefined}
            >
              <img
                src={projectData.thumbnailUrl || PROJECT_DEFAULT_IMAGE}
                className={style.image}
                alt={i18n.projectThumbnail()}
              />
            </a>
          </div>
          <a
            style={styles.titleLink}
            href={studio(url)}
            target={isPublicGallery ? '_blank' : undefined}
          >
            <div
              style={styles.title}
              className={`ui-project-name-${projectData.type}`}
            >
              {projectData.name}
            </div>
          </a>
          <div style={noTimeOnCardStyle}>
            {isPublicGallery && projectData.studentName && (
              <span className={style.firstInitial}>
                {i18n.by()}:&nbsp;
                <span className={style.bold}>{projectData.studentName}</span>
              </span>
            )}
            {isPublicGallery && projectData.studentAgeRange && (
              <span className={style.ageRange}>
                {i18n.age()}:&nbsp;
                <span className={style.bold}>
                  {projectData.studentAgeRange}
                </span>
              </span>
            )}
          </div>
          {shouldShowPublicDetails && !projectData.isFeatured && (
            <div className={style.lastEdit}>
              {i18n.published()}:&nbsp;
              <UnlocalizedTimeAgo
                className={style.bold}
                dateString={projectData.publishedAt}
              />
            </div>
          )}
          {shouldShowPublicDetails && projectData.isFeatured && (
            <div className={style.lastEdit}>
              <span className={style.bold}>{i18n.featuredProject()}</span>
            </div>
          )}
          {isPersonalGallery && projectData.updatedAt && (
            <div className={style.lastEdit}>
              {i18n.projectLastUpdated()}:&nbsp;
              <UnlocalizedTimeAgo
                dateString={projectData.updatedAt}
                className={style.bold}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  title: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 18,
    paddingBottom: 5,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.neutral_dark,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    height: 18,
    boxSizing: 'content-box',
  },
  titleLink: {
    color: color.neutral_dark,
    textDecoration: 'none',
  },
  thumbnail: {
    width: 214,
    height: 150,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullThumbnail: {
    height: 214,
  },
  noTime: {
    paddingBottom: 10,
  },
  checkboxSpan: {
    flex: '1',
    verticalAlign: 'middle',
  },
  header: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
  },
};
