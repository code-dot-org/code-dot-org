/**
 * Page for creating a workshop enrollment when joining a session
 */
import React, {PropTypes} from 'react';
import {WorkshopPropType} from './enrollmentConstants';
import WorkshopDetails from './workshop_details';
import EnrollForm from './enroll_form';

const SUBMISSION_STATUSES = {
  UNSUBMITTED: "unsubmitted",
  SUCCESS: "success",
  ACCOUNT_NEEDS_UPGRADE: "upgrade",
  ERROR: "error"
};

export default class JoinSession extends React.Component {
  static propTypes = {
    workshop: WorkshopPropType,
    session_dates: PropTypes.arrayOf(PropTypes.string),
    enrollment: PropTypes.shape({
      email: PropTypes.string,
      first_name: PropTypes.string
    }),
    workshop_enrollment_status: PropTypes.string,
    session_code: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      workshopEnrollmentStatus: this.props.workshop_enrollment_status || SUBMISSION_STATUSES.UNSUBMITTED
    };
  }

  onSubmissionComplete = (result) => {
    if (result.responseJSON && result.responseJSON.workshop_enrollment_status === SUBMISSION_STATUSES.ACCOUNT_NEEDS_UPGRADE) {
      window.location.href = `/pd/attend/${this.props.session_code}/upgrade`;
    } else if (result.responseJSON && result.responseJSON.workshop_enrollment_status === SUBMISSION_STATUSES.SUCCESS) {
      window.location.href = `/pd/attend/${this.props.session_code}`;
    } else {
      this.setState({workshopEnrollmentStatus: SUBMISSION_STATUSES.ERROR});
    }
  };

  renderError() {
    return (
      <div>
        <p>
          Sorry, an error occurred and we were unable to enroll you in this workshop.
          Please contact <a href="mailto:support@code.org">support@code.org</a>.
        </p>
      </div>
    );
  }

  render() {
    const formStyle = {
      marginLeft: '0px'
    };

    if (this.state.workshopEnrollmentStatus === SUBMISSION_STATUSES.UNSUBMITTED) {
      return (
        <div>
          <h1>
            Join this workshop
          </h1>
          <WorkshopDetails
            workshop={this.props.workshop}
            session_dates={this.props.session_dates}
          />
          <h2>Please complete and confirm the information below.</h2>
          <div
            className="span6"
            style={formStyle}
          >
            <EnrollForm
              workshop_id={this.props.workshop.id}
              workshop_course={this.props.workshop.course}
              first_name={this.props.enrollment.first_name}
              email={this.props.enrollment.email}
              onSubmissionComplete={this.onSubmissionComplete}
              submitText="Confirm"
              submitUrl={`/api/v1/pd/attend/${this.props.session_code}/join`}
            />
          </div>
        </div>
      );
    } else {
      return this.renderError();
    }
  }
}
