import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {putRecord} from '../lib/util/firehose';
import TeacherInfoBanner from './TeacherInfoBanner';

export default class DonorTeacherBanner extends Component {
  static propTypes = {
    showPegasusLink: PropTypes.bool,
    source: PropTypes.string.isRequired
  };

  initialState = {
    participate: undefined,
    submitted: false
  };

  state = this.initialState;

  onParticipateChange = event => {
    this.setState({
      participate: event.target.id === 'participateYes'
    });
  };

  handleSubmit = event => {
    if (this.state.participate) {
      putRecord({
        study: 'afe-schools',
        event: 'submit',
        data_string: $('input[name="nces-id"]').val()
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
        source: this.props.source
      }
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
                Amazon Future Engineer Program? Learn more
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
      <TeacherInfoBanner
        header="Free stuff from Amazon for your classroom"
        primaryButton={{
          onClick: this.handleSubmit,
          text: 'Submit',
          disabled: this.state.participate === undefined
        }}
        secondaryButton={{
          isHidden: !this.props.showPegasusLink,
          href: pegasus('/amazon-future-engineer'),
          text: 'Learn more'
        }}
      >
        {this.renderBannerContent()}
      </TeacherInfoBanner>
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
    marginBottom: 10
  },
  label: {
    fontFamily: '"Gotham 4r", sans-serif',
    cursor: 'pointer'
  },
  radio: {
    verticalAlign: 'top',
    marginRight: 10,
    cursor: 'pointer'
  }
};
