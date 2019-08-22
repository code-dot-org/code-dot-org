import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from './Button';
import styleConstants from '../styleConstants';
import color from '@cdo/apps/util/color';

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
    width: styleConstants['content-width'],
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
    teacherFirstName: PropTypes.string,
    teacherLastName: PropTypes.string,
    teacherEmail: PropTypes.string,
    ncesId: PropTypes.string
  };

  initialState = {
    participate: undefined,
    permission: false
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

  handleSubmit = event => {};

  renderDonorForm() {
    const permissionStyle = this.state.participate
      ? styles.permissionEnabled
      : styles.permissionDisabled;

    const buttonDisabled =
      this.state.participate === undefined ||
      (this.state.participate === true && this.state.permission !== true);

    return (
      <div style={styles.message}>
        <h2>Free stuff from Amazon for your classroom</h2>
        <div style={styles.paragraph}>
          Amazon Future Engineer offers free support for participating Code.org
          classrooms, including posters, free CSTA+ membership, internship and
          scholarship opportunities, and access to cloud computing resources.
        </div>
        <div style={styles.paragraph}>
          Would you like to participate in the Amazon Future Engineer Program?
          Learn more
        </div>
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
            school information with Amazon.com (required to participate). Use of
            your personal information by Amazon is subject to Amazon’s Privacy
            Policy. You may be required to agree to additional terms and
            conditions with Amazon directly. <span style={styles.red}>*</span>
          </label>
        </div>

        <Button
          onClick={this.handleSubmit}
          style={styles.button}
          size="large"
          text="Submit"
          disabled={buttonDisabled}
        />
      </div>
    );
  }

  render() {
    let mainForm;

    /*if (this.props.submittedSuccessfully) {
      mainForm = this.renderThankYou();
    } else if (this.state.showSchoolInfoForm) {
      mainForm = this.renderSchoolInfoForm();
    } else {
      mainForm = this.renderCensusForm();
    }*/

    mainForm = this.renderDonorForm();

    return (
      <div style={styles.main}>
        {mainForm}
        <div style={styles.clear} />
      </div>
    );
  }
}
