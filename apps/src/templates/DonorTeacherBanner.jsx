import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from './Button';
import color from '@cdo/apps/util/color';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';

const styles = {
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15
  },
  checkbox: {
    margin: '0 7px 0 0'
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
  radio: {
    verticalAlign: 'top',
    marginRight: 10
  },
  permissionEnabled: {},
  permissionDisabled: {
    opacity: 0.5
  },
  red: {
    color: color.red
  }
};

export default class TeacherDonorBanner extends Component {
  static propTypes = {
    teacherFirstName: PropTypes.string.isRequired,
    teacherSecondName: PropTypes.string.isRequired,
    teacherEmail: PropTypes.string.isRequired,
    ncesSchoolId: PropTypes.string.isRequired,
    schoolAddress1: PropTypes.string,
    schoolAddress2: PropTypes.string,
    schoolAddress3: PropTypes.string,
    schoolCity: PropTypes.string,
    schoolState: PropTypes.string,
    schoolZip: PropTypes.string,
    onDismiss: PropTypes.func.isRequired
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
    this.props.onDismiss();
  };

  renderDonorForm() {
    const permissionStyle = this.state.participate
      ? styles.permissionEnabled
      : styles.permissionDisabled;

    const buttonDisabled =
      this.state.participate === undefined ||
      (this.state.participate === true && this.state.permission !== true);

    return (
      <div style={styles.main}>
        <div style={styles.message}>
          <h2>Free stuff from Amazon for your classroom</h2>
          <div style={styles.paragraph}>
            Amazon Future Engineer offers free support for participating
            Code.org classrooms, including posters, free CSTA+ membership,
            internship and scholarship opportunities, and access to cloud
            computing resources.
          </div>
          <div style={styles.paragraph}>
            Would you like to participate in the Amazon Future Engineer Program?
            Learn more
          </div>
          <div>
            <div>
              <label>
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
              <label>
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
            <label>
              <input
                type="checkbox"
                name={name}
                checked={this.state.permission}
                onChange={this.onPermissionChange}
                style={styles.checkbox}
                disabled={this.state.participate !== true}
              />
              I give Code.org permission to share my name, email address, and
              school information with Amazon.com (required to participate). Use
              of your personal information by Amazon is subject to Amazon’s
              Privacy Policy. You may be required to agree to additional terms
              and conditions with Amazon directly.{' '}
              <span style={styles.red}>*</span>
            </label>
          </div>

          <form
            id="hidden_form"
            action="https://afe.qa.amazon-blogs.psdops.com/code-org-afe"
            method="post"
            target="_blank"
          >
            <input
              type="hidden"
              name="first-name"
              value={this.props.teacherFirstName}
            />
            <input
              type="hidden"
              name="last-name"
              value={this.props.teacherSecondName}
            />
            <input type="hidden" name="email" value={this.props.teacherEmail} />
            <input
              type="hidden"
              name="nces-id"
              value={this.props.ncesSchoolId}
            />
            {this.props.schoolAddress1 && (
              <input
                type="hidden"
                name="school-address-1"
                value={this.props.schoolAddress1}
              />
            )}
            {this.props.schoolAddress2 && (
              <input
                type="hidden"
                name="school-address-2"
                value={this.props.schoolAddress2}
              />
            )}
            {this.props.schoolAddress3 && (
              <input
                type="hidden"
                name="school-address-3"
                value={this.props.schoolAddress3}
              />
            )}
            <input
              type="hidden"
              name="school-city"
              value={this.props.schoolCity}
            />
            <input
              type="hidden"
              name="school-state"
              value={this.props.schoolState}
            />
            <input
              type="hidden"
              name="school-zip"
              value={this.props.schoolZip}
            />
          </form>

          <Button
            onClick={this.handleSubmit}
            style={styles.button}
            size="large"
            text="Submit"
            disabled={buttonDisabled}
          />
        </div>
        <div style={styles.clear} />
      </div>
    );
  }

  renderThankYou() {
    return (
      <Notification
        type={NotificationType.success}
        notice="Your response has been submitted!"
        details="If you change your mind, you can sign up later at the bottom of this page"
        dismissible={true}
      />
    );
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
