import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import fontConstants from '@cdo/apps/fontConstants';
import {putRecord} from '../lib/util/firehose';
import color from '../util/color';
import Button from './Button';

export default class DonorTeacherBanner extends Component {
  static propTypes = {
    showPegasusLink: PropTypes.bool,
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
      putRecord({
        study: 'afe-schools',
        event: 'submit',
        data_string: $('input[name="nces-id"]').val(),
      });

      // redirect to form on amazon-future-engineer page
      window.location.assign(pegasus('/amazon-future-engineer#sign-up-today'));
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
        <div style={styles.paragraph}>
          Amazon Future Engineer offers free support for participating Code.org
          classrooms, including posters, free CSTA+ membership, internship and
          scholarship opportunities, and access to cloud computing resources.
        </div>
        <div style={styles.paragraph}>
          Would you like to participate in the{' '}
          {!this.props.showPegasusLink && (
            <span>Amazon Future Engineer Program?</span>
          )}
          {this.props.showPegasusLink && (
            <span>
              <a href={pegasus('/amazon-future-engineer')}>
                Amazon Future Engineer Program?
              </a>
            </span>
          )}
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
              Yes!
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
              No thanks, maybe later
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
          <h2 style={styles.heading}>
            {'Free resources from Amazon for your classroom'}
          </h2>
          {this.renderBannerContent()}
          <div style={styles.buttonArea}>
            <Button
              onClick={this.handleSubmit}
              style={styles.button}
              color={Button.ButtonColor.brandSecondaryDefault}
              text={'Submit'}
              disabled={this.state.participate === undefined}
            />
            {this.props.showPegasusLink && (
              <Button
                __useDeprecatedTag
                href={pegasus('/amazon-future-engineer')}
                style={styles.secondaryButton}
                color={Button.ButtonColor.white}
                text={'Learn more'}
              />
            )}
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
          notice="Your response has been submitted!"
          details="Thank you for your response.  If you are not redirected to the form in a few moments,"
          detailsLinkText="click here"
          detailsLink={pegasus('/amazon-future-engineer#sign-up-today')}
          detailsLinkNewWindow={true}
          dismissible={true}
        />
      );
    } else {
      return (
        <Notification
          type={NotificationType.success}
          notice="Your response has been submitted!"
          details="If you change your mind, you can sign up later at the bottom of this page."
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
