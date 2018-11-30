/**
 * New workshop enrollment page
 */
import React, {PropTypes} from 'react';
import WorkshopDetails from './workshop_details';
import FacilitatorBio from './facilitator_bio';
import SignInPrompt from './sign_in_prompt';
import EnrollForm from './enroll_form';
import {
  WorkshopPropType,
  FacilitatorPropType
} from './enrollmentConstants';

const SUBMISSION_STATUSES = {
  UNSUBMITTED: "unsubmitted",
  DUPLICATE: "duplicate",
  OWN: "own",
  CLOSED: "closed",
  FULL: "full",
  NOT_FOUND: "not found",
  SUCCESS: "success",
  UNKNOWN_ERROR: "error"
};

export default class WorkshopEnrollment extends React.Component {
  static propTypes = {
    workshop: WorkshopPropType,
    session_dates: PropTypes.arrayOf(PropTypes.string),
    enrollment: PropTypes.shape({
      email: PropTypes.string,
      first_name: PropTypes.string
    }),
    facilitators: PropTypes.arrayOf(FacilitatorPropType),
    sign_in_prompt_data: PropTypes.shape({
      info_icon: PropTypes.string,
      sign_in_url: PropTypes.string
    }),
    workshop_enrollment_status: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      workshopEnrollmentStatus: this.props.workshop_enrollment_status || SUBMISSION_STATUSES.UNSUBMITTED
    };
  }

  onSubmissionComplete = (result) => {
    if (result.responseJSON) {
      this.setState({
        workshopEnrollmentStatus: result.responseJSON.workshop_enrollment_status,
        cancelUrl: result.responseJSON.cancel_url,
        accountExists: result.responseJSON.account_exists,
        signUpUrl: result.responseJSON.sign_up_url,
        workshopUrl: result.responseJSON.workshop_url
      });
    } else {
      this.setState({workshopEnrollmentStatus: SUBMISSION_STATUSES.UNKNOWN_ERROR});
    }
  };

  renderDuplicate() {
    return (
      <div>
        <h1>
          Thank you for registering
        </h1>
        <p>
          You are already registered, and should have received a confirmation email.
        </p>
        <p>
          If you need to cancel, click <a href={this.state.cancelUrl}>{this.state.cancelUrl}</a>
        </p>
      </div>
    );
  }

  renderOwn() {
    return (
      <div>
        <p>
          You are attempting to join your own <a href={this.state.workshopUrl}>workshop.</a>
        </p>
      </div>
    );
  }

  renderFull() {
    return (
      <div>
        <p>
          Sorry, this workshop is full.
        </p>
        <p>
          For more information, please contact the organizer: <a href={`mailto:${this.props.workshop.organizer.email}`}>{this.props.workshop.organizer.email}</a>
        </p>
      </div>
    );
  }

  renderClosed() {
    return (
      <div>
        <p>
          Sorry, this workshop is closed.
        </p>
        <p>
          For more information, please contact the organizer: <a href={`mailto:${this.props.workshop.organizer.email}`}>{this.props.workshop.organizer.email}</a>
        </p>
      </div>
    );
  }

  renderNotFound() {
    return (
      <div>
        <p>
          Sorry, this workshop could not be found.
        </p>
      </div>
    );
  }

  renderUnknownError() {
    return (
      <div>
        <p>
          Sorry, an error occurred and we were unable to enroll you in this workshop.
          Please contact <a href="mailto:support@code.org">support@code.org</a>.
        </p>
      </div>
    );
  }

  renderSuccess() {
    return (
      <div>
        <h1>
          Thank you for registering
        </h1>
        <p>
          You will receive a confirmation email. If you have any questions or need to
          request special accommodations, please reach out directly to the workshop
          organizer: {this.props.workshop.organizer.name} at {this.props.workshop.organizer.email}.
        </p>
        <p>
          If you need to cancel, click <a href={this.state.cancelUrl}>here</a>.
        </p>
        <br/>
        {!this.state.accountExists &&
          <div>
            <h1>
              Get a Head Start: Create Your Code.org Account
            </h1>
            <p>
              If you don’t have a Code.org account yet, click below
              to create one. You'll need a Code.org account on the day of the workshop.
              You'll use this account to manage your students and view their progress
              when you start teaching, so be sure to use the email you'll use when you
              teach.
            </p>

            <a href={this.state.signUpUrl}>
              <button className="primary">
                Create account now
              </button>
            </a>
          </div>
        }
      </div>
    );
  }

  render() {
    switch (this.state.workshopEnrollmentStatus) {
      case SUBMISSION_STATUSES.UNSUBMITTED:
        return (
          <div>
            <h1>
              {`Register for a ${this.props.workshop.course} workshop`}
            </h1>
            <p>
              Taught by Code.org facilitators who are experienced computer science educators,
              our workshops will prepare you to teach the Code.org curriculum.
            </p>
            <div className="container">
              <div className="row">
                {/* Left Column */}
                <div className ="span6">
                  <WorkshopDetails
                    workshop={this.props.workshop}
                    session_dates={this.props.session_dates}
                  />
                  <h2>Facilitators</h2>
                  {this.props.facilitators.map(facilitator => (
                    <FacilitatorBio
                      key={facilitator.email}
                      facilitator={facilitator}
                    />
                  ))}
                </div>
                {/* Right Column */}
                <div className ="span6">
                  <div className="row">
                    <div className ="span6">
                      <h2>Your Information</h2>
                      {
                        !this.props.enrollment.email &&
                        <SignInPrompt
                          info_icon={this.props.sign_in_prompt_data.info_icon}
                          sign_in_url={this.props.sign_in_prompt_data.sign_in_url}
                        />
                      }
                      <EnrollForm
                        workshop_id={this.props.workshop.id}
                        workshop_course={this.props.workshop.course}
                        first_name={this.props.enrollment.first_name}
                        email={this.props.enrollment.email}
                        onSubmissionComplete={this.onSubmissionComplete}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case SUBMISSION_STATUSES.DUPLICATE:
        return this.renderDuplicate();
      case SUBMISSION_STATUSES.OWN:
        return this.renderOwn();
      case SUBMISSION_STATUSES.CLOSED:
        return this.renderClosed();
      case SUBMISSION_STATUSES.FULL:
        return this.renderFull();
      case SUBMISSION_STATUSES.NOT_FOUND:
        return this.renderNotFound();
      case SUBMISSION_STATUSES.SUCCESS:
        return this.renderSuccess();
      default:
        return this.renderUnknownError();
    }
  }
}
