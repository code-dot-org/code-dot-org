import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from './Button';
import color from '@cdo/apps/util/color';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  heading: {
    marginTop: 25
  },
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15
  },
  checkbox: {
    margin: '0 7px 4px 0',
    cursor: 'pointer',
    verticalAlign: 'middle'
  },
  checkboxDisabled: {
    margin: '0 7px 4px 0',
    cursor: 'not-allowed',
    verticalAlign: 'middle'
  },
  clear: {
    clear: 'both'
  },
  error: {
    color: color.red
  },
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20
  },
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    minHeight: 72,
    backgroundColor: color.white,
    overflowWrap: 'break-word'
  },
  message: {
    marginTop: 0,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 14
  },
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
  },
  permissionEnabled: {},
  permissionDisabled: {
    opacity: 0.5
  },
  red: {
    color: color.red
  }
};

export const donorTeacherBannerOptionsShape = PropTypes.shape({
  teacherFirstName: PropTypes.string,
  teacherSecondName: PropTypes.string,
  teacherEmail: PropTypes.string,
  ncesSchoolId: PropTypes.string,
  schoolAddress1: PropTypes.string,
  schoolAddress2: PropTypes.string,
  schoolAddress3: PropTypes.string,
  schoolCity: PropTypes.string,
  schoolState: PropTypes.string,
  schoolZip: PropTypes.string
});

export default class DonorTeacherBanner extends Component {
  static propTypes = {
    options: donorTeacherBannerOptionsShape,
    showPegasusLink: PropTypes.bool,
    source: PropTypes.string.isRequired
  };

  initialState = {
    permission: false,
    participate: undefined,
    submitted: false
  };

  state = this.initialState;

  onParticipateChange = event => {
    this.setState({
      participate: event.target.id === 'participateYes'
    });
  };

  onPermissionChange = event => {
    this.setState({
      permission: event.target.checked
    });
  };

  handleSubmit = event => {
    if (this.state.permission && this.state.participate) {
      // Post to the external endpoint in a new tab.
      $('#hidden_form').submit();
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

  renderDonorForm() {
    const permissionStyle = this.state.participate
      ? styles.permissionEnabled
      : styles.permissionDisabled;

    const buttonDisabled =
      this.state.participate === undefined ||
      (this.state.participate === true && this.state.permission !== true);

    const optionFields = {
      teacherFirstName: 'first-name',
      teacherSecondName: 'last-name',
      teacherEmail: 'email',
      ncesSchoolId: 'nces-id',
      schoolAddress1: 'school-address-1',
      schoolAddress2: 'school-address-2',
      schoolAddress3: 'school-address-3',
      schoolCity: 'school-city',
      schoolState: 'school-state',
      schoolZip: 'school-zip'
    };

    const schoolLink =
      'https://support.code.org/hc/en-us/articles/360031291431-What-does-school-information-refer-to-';
    const amazonLink =
      'https://www.amazon.com/gp/help/customer/display.html?ie=UTF8&nodeId=468496';

    return (
      <div style={styles.main}>
        <div style={styles.message}>
          <h2 style={styles.heading}>
            Free stuff from Amazon for your classroom
          </h2>
          <div style={styles.paragraph}>
            Amazon Future Engineer offers free support for participating
            Code.org classrooms, including posters, free CSTA+ membership,
            internship and scholarship opportunities, and access to cloud
            computing resources.
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
          <hr />
          <div style={permissionStyle}>
            <label style={styles.label}>
              <input
                type="checkbox"
                name={name}
                checked={this.state.permission}
                onChange={this.onPermissionChange}
                style={
                  this.state.participate
                    ? styles.checkbox
                    : styles.checkboxDisabled
                }
                disabled={this.state.participate !== true}
              />
              I give Code.org permission to share my name, email address, and{' '}
              <a href={schoolLink} target="_blank">
                school name and ID
              </a>{' '}
              with Amazon.com (required to participate). Use of your personal
              information by Amazon is subject to{' '}
              <a href={amazonLink} target="_blank">
                Amazon’s Privacy Policy
              </a>
              . You may be required to agree to additional terms and conditions
              with Amazon directly. <span style={styles.red}>*</span>
            </label>
          </div>

          <form
            id="hidden_form"
            action="https://afe.qa.amazon-blogs.psdops.com/code-org-afe"
            method="post"
            target="_blank"
          >
            {Object.keys(optionFields)
              .filter(key => this.props.options[key])
              .map(key => (
                <input
                  key={key}
                  type="hidden"
                  name={optionFields[key]}
                  value={this.props.options[key]}
                />
              ))}
          </form>

          <Button
            onClick={this.handleSubmit}
            style={styles.button}
            size="large"
            text="Submit"
            disabled={buttonDisabled}
          />

          {this.props.showPegasusLink && (
            <Button
              href={pegasus('/amazon-future-engineer')}
              style={styles.button}
              color={Button.ButtonColor.gray}
              size="large"
              text="Learn more"
            />
          )}
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
          detailsLink="https://afe.qa.amazon-blogs.psdops.com/code-org-afe"
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
