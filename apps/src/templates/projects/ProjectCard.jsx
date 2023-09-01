/* eslint-disable react/jsx-no-target-blank */
import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import getScriptData from '@cdo/apps/util/getScriptData';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import cookies from 'js-cookie';
import _ from 'lodash';
import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';
import style from './project-card.module.scss';
import Button from '@cdo/apps/templates/Button';

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
      showSubmittedHeader: false, // may need to change this state in the future to utilize the report cookies - if gallery ever keeps an immediate report
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
          this.writeCookie();
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

  writeCookie() {
    // Use cookies from 'js-cookie' package
    if (cookies.get('reported_abuse')) {
      const reportedProjectIds = JSON.parse(cookies.get('reported_abuse'));
      reportedProjectIds.push(this.props.projectData.channel); // Using channel for the project as the ID
      cookies.set('reported_abuse', _.uniq(reportedProjectIds));
    } else {
      cookies.set('reported_abuse', [this.props.projectData.channel]); // Using channel for the project as the ID
    }
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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <h3 style={{margin: 10}}>Thank you!</h3>
                <p style={{margin: 10}}>
                  Thanks for helping us to keep Code.org safe!
                </p>
                <Button
                  onClick={this.cancel}
                  text={'Continue'}
                  color={Button.ButtonColor.brandSecondaryDefault}
                  style={{margin: 10}}
                />
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3 style={{margin: 0}}>Report Abuse</h3>
                  <button
                    type="reset"
                    onClick={this.cancel}
                    style={{
                      ...styles.transparentButton,
                      background: 'none',
                      width: 24,
                      height: 24,
                      fontSize: 16,
                      padding: 5,
                    }}
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
                    <label
                      key={checkbox.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: 5,
                        marginBottom: 5,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checkbox.checked}
                        onChange={() =>
                          this.handleCheckboxChange(checkbox.name)
                        }
                        style={{
                          marginRight: 10,
                          marginTop: 0,
                          accentColor: '#0093A4',
                        }}
                      />
                      <span
                        className={style.popUpBody}
                        style={{
                          flex: '1',
                          verticalAlign: 'middle',
                        }}
                      >
                        {checkbox.name.replace(/-/g, ' ')}
                      </span>
                    </label>
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
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
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
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={this.showReportAbusePopUp}
                style={{
                  ...styles.transparentButton,
                  padding: 6,
                  marginRight: 16,
                  boxShadow: 'none',
                }}
                className={style.cautionButton}
              >
                <FontAwesome
                  icon="circle-exclamation"
                  className={style.cautionIcon}
                  style={{
                    fontSize: 16,
                  }}
                />
              </button>
            </div>
          ) : (
            <div
              style={{
                ...thumbnailStyle,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p
                style={{
                  margin: 'auto',
                  color: 'red',
                  fontFamily: '"Gotham 5r", sans-serif',
                  fontSize: 12,
                }}
              >
                Reported
              </p>
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
  transparentButton: {
    boxShadow: 'none',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
  },
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
};
