/**
 * New workshop enrollment page
 */
import PropTypes from 'prop-types';
import React from 'react';
import WorkshopDetails from './workshop_details';
import FacilitatorBio from './facilitator_bio';
import EnrollForm from './enroll_form';
import {WorkshopPropType, FacilitatorPropType} from './enrollmentConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const SUBMISSION_STATUSES = {
  UNSUBMITTED: 'unsubmitted',
  DUPLICATE: 'duplicate',
  OWN: 'own',
  CLOSED: 'closed',
  FULL: 'full',
  NOT_FOUND: 'not found',
  SUCCESS: 'success',
  UNKNOWN_ERROR: 'error',
};

export default class WorkshopEnroll extends React.Component {
  static propTypes = {
    user_id: PropTypes.number.isRequired,
    workshop: WorkshopPropType,
    session_dates: PropTypes.arrayOf(PropTypes.string),
    enrollment: PropTypes.shape({
      email: PropTypes.string,
      first_name: PropTypes.string,
    }),
    facilitators: PropTypes.arrayOf(FacilitatorPropType),
    workshop_enrollment_status: PropTypes.string,
    previous_courses: PropTypes.arrayOf(PropTypes.string).isRequired,
    collect_demographics: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      workshopEnrollmentStatus:
        this.props.workshop_enrollment_status ||
        SUBMISSION_STATUSES.UNSUBMITTED,
    };
  }

  onSubmissionComplete = result => {
    if (result.responseJSON) {
      this.setState({
        workshopEnrollmentStatus:
          result.responseJSON.workshop_enrollment_status,
        cancelUrl: result.responseJSON.cancel_url,
        accountExists: result.responseJSON.account_exists,
        signUpUrl: result.responseJSON.sign_up_url,
        workshopUrl: result.responseJSON.workshop_url,
      });
    } else {
      this.setState({
        workshopEnrollmentStatus: SUBMISSION_STATUSES.UNKNOWN_ERROR,
      });
    }
  };

  renderDuplicate() {
    return (
      <div>
        <h1>Thank you for registering</h1>
        <p>
          You are already registered, and should have received a confirmation
          email.
        </p>
        <p>
          If you need to cancel, click{' '}
          <a href={this.state.cancelUrl}>{this.state.cancelUrl}</a>
        </p>
      </div>
    );
  }

  renderOwn() {
    return (
      <div>
        <p>
          You are attempting to join your own{' '}
          <a href={this.state.workshopUrl}>workshop.</a>
        </p>
      </div>
    );
  }

  renderFull() {
    return (
      <div>
        <p>Sorry, this workshop is full.</p>
        <p>
          For more information, please contact the organizer:{' '}
          <a href={`mailto:${this.props.workshop.organizer.email}`}>
            {this.props.workshop.organizer.email}
          </a>
        </p>
      </div>
    );
  }

  renderClosed() {
    return (
      <div>
        <p>Sorry, this workshop is closed.</p>
        <p>
          For more information, please contact the organizer:{' '}
          <a href={`mailto:${this.props.workshop.organizer.email}`}>
            {this.props.workshop.organizer.email}
          </a>
        </p>
      </div>
    );
  }

  renderNotFound() {
    return (
      <div>
        <p>Sorry, this workshop could not be found.</p>
      </div>
    );
  }

  renderSuccess() {
    analyticsReporter.sendEvent(EVENTS.WORKSHOP_ENROLLMENT_COMPLETED_EVENT, {
      'regional partner': this.props.workshop.regional_partner?.name,
      'workshop course': this.props.workshop.course,
      'workshop subject': this.props.workshop.subject,
    });
    return (
      <div>
        <h1>Thank you for registering</h1>
        <p>
          You will receive a confirmation email. If you have any questions or
          need to request special accommodations, please reach out directly to
          the workshop organizer: {this.props.workshop.organizer.name} at{' '}
          {this.props.workshop.organizer.email}.
        </p>
        <p>
          If you need to cancel, click <a href={this.state.cancelUrl}>here</a>.
        </p>
        <br />
        {!this.state.accountExists && (
          <div>
            <h1>Get a Head Start: Create Your Code.org Account</h1>
            <p>
              If you don’t have a Code.org account yet, click below to create
              one. You'll need a Code.org account on the day of the workshop.
              You'll use this account to manage your students and view their
              progress when you start teaching, so be sure to use the email
              you'll use when you teach.
            </p>

            <a href={this.state.signUpUrl}>
              <button type="button" className="primary">
                Create account now
              </button>
            </a>
          </div>
        )}
      </div>
    );
  }

  render() {
    switch (this.state.workshopEnrollmentStatus) {
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
        return (
          <div>
            <h1>{`Register for a ${this.props.workshop.course} workshop`}</h1>
            <p>
              Taught by Code.org facilitators who are experienced computer
              science educators, our workshops will prepare you to teach the
              Code.org curriculum.
            </p>
            <div className="container">
              <div className="row">
                {/* Left Column */}
                <div className="span6">
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
                <div className="span6">
                  <div className="row">
                    <div className="span6">
                      <h2>Your Information</h2>
                      <EnrollForm
                        user_id={this.props.user_id}
                        workshop_id={this.props.workshop.id}
                        workshop_course={this.props.workshop.course}
                        first_name={this.props.enrollment.first_name}
                        email={this.props.enrollment.email}
                        onSubmissionComplete={this.onSubmissionComplete}
                        workshop_subject={this.props.workshop.subject}
                        previous_courses={this.props.previous_courses}
                        collect_demographics={this.props.collect_demographics}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }
}
