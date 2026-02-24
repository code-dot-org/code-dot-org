import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Notification, {
  NotificationType,
} from '@cdo/apps/sharedComponents/Notification';
import i18n from '@cdo/locale';

import color from '../util/color';

export default class DonorTeacherBanner extends Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
  };

  initialState = {
    participate: undefined,
    submitted: false,
  };

  state = this.initialState;

  onParticipateChange = event => {
    this.setState({
      participate: event.target.id === 'participateYes',
    });
  };

  handleSubmit = event => {
    if (this.state.participate) {
      analyticsReporter.sendEvent(EVENTS.AFE_HOMEPAGE_BANNER_SUBMIT);

      // redirect to form on amazon-future-engineer page
      window.location.assign(pegasus('/amazon-future-engineer#eligibility'));
    }

    this.setState({submitted: true});

    this.dismiss();
  };

  dismissWithCallbacks(onSuccess, onFailure) {
    $.ajax({
      url: '/dashboardapi/v1/users/me/dismiss_donor_teacher_banner',
      type: 'post',
      data: {
        participate: this.state.participate,
        source: this.props.source,
      },
    })
      .done(onSuccess)
      .fail(onFailure);
  }

  logDismissError = xhr => {
    console.log(`Failed to dismiss donor teacher banner! ${xhr.responseText}`);
  };

  dismiss() {
    this.dismissWithCallbacks(null, this.logDismissError);
  }

  renderBannerContent() {
    return (
      <div>
        <div style={styles.paragraph}>{i18n.afeBannerParagraph()}</div>
        <div style={styles.paragraph}>
          {i18n.afeFreeResources()}
          <span>
            <a href={pegasus('/amazon-future-engineer')}>
              {i18n.amazonFutureEngineer()}
            </a>
          </span>
        </div>
        <div>
          <div>
            <label style={styles.label}>
              <input
                type="radio"
                id="participateYes"
                name="donorTeacherBannerParticipate"
                value="SOME"
                style={styles.radio}
                onChange={this.onParticipateChange}
                checked={this.state.participate === true}
              />
              {i18n.yesExcited()}
            </label>
          </div>
          <div>
            <label style={styles.label}>
              <input
                type="radio"
                id="participateNo"
                name="donorTeacherBannerParticipate"
                value="SOME"
                style={styles.radio}
                onChange={this.onParticipateChange}
                checked={this.state.participate === false}
              />
              {i18n.noThanksMaybeLater()}
            </label>
          </div>
        </div>
      </div>
    );
  }

  renderDonorForm() {
    return (
      <div style={styles.main}>
        <div style={styles.message}>
          <h2 style={styles.heading}>{i18n.afeBannerCongrats()}</h2>
          {this.renderBannerContent()}
          <div style={styles.buttonArea}>
            <Button
              onClick={this.handleSubmit}
              style={styles.button}
              color={Button.ButtonColor.brandSecondaryDefault}
              text={i18n.submit()}
              disabled={this.state.participate === undefined}
            />
            <Button
              __useDeprecatedTag
              href={pegasus('/amazon-future-engineer')}
              style={styles.secondaryButton}
              color={Button.ButtonColor.white}
              text={i18n.learnMore()}
            />
          </div>
        </div>
        <div style={styles.clear} />
      </div>
    );
  }

  renderThankYou() {
    if (this.state.participate) {
      return (
        <Notification
          type={NotificationType.success}
          notice={i18n.yourResponseSubmitted()}
          details={i18n.thankYouForResponse()}
          detailsLinkText={i18n.clickHere()}
          detailsLink={pegasus('/amazon-future-engineer#eligibility')}
          detailsLinkNewWindow={true}
          dismissible={true}
        />
      );
    } else {
      return (
        <Notification
          type={NotificationType.success}
          notice={i18n.yourResponseSubmitted()}
          details={i18n.changeYourMind()}
          dismissible={true}
        />
      );
    }
  }

  render() {
    let mainForm;

    if (this.state.submitted) {
      mainForm = this.renderThankYou();
    } else {
      mainForm = this.renderDonorForm();
    }

    return mainForm;
  }
}

const styles = {
  paragraph: {
    marginBottom: 10,
    fontSize: 14,
    ...fontConstants['main-font-regular'],
    lineHeight: '22px',
    color: color.neutral_dark,
  },
  label: {
    ...fontConstants['main-font-regular'],
    cursor: 'pointer',
  },
  radio: {
    verticalAlign: 'top',
    marginRight: 10,
    cursor: 'pointer',
  },
  buttonArea: {
    display: 'flex',
  },
  heading: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 24,
    lineHeight: '26px',
    ...fontConstants['main-font-regular'],
    color: color.neutral_dark,
  },
  button: {
    marginLeft: 7,
    marginRight: 7,
    ...fontConstants['main-font-semi-bold'],
    lineHeight: '30px',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: Button.ButtonColor.brandSecondaryDefault,
  },
  secondaryButton: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 5,
    boxShadow: 'none',
    ...fontConstants['main-font-semi-bold'],
    color: color.neutral_dark,
    lineHeight: '30px',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.neutral_dark,
  },
  clear: {
    clear: 'both',
  },
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20,
  },
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    minHeight: 72,
    backgroundColor: color.white,
    overflowWrap: 'break-word',
  },
  message: {
    marginTop: 0,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 14,
  },
};
