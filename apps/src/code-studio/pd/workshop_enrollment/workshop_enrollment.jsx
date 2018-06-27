/**
 * New workshop enrollment page
 */
import React, {PropTypes} from 'react';
import WorkshopDetails from './workshop_details';
import FacilitatorBio from './facilitator_bio';
import SignInPrompt from './sign_in_prompt';
import EnrollForm from './enroll_form';

export default class WorkshopEnrollment extends React.Component {
  static propTypes = {
    workshop: PropTypes.object,
    session_dates: PropTypes.arrayOf(PropTypes.string),
    enrollment: PropTypes.object,
    facilitators: PropTypes.arrayOf(PropTypes.object),
    logged_in: PropTypes.bool,
    sign_in_prompt_data: PropTypes.object,
    user_email: PropTypes.string
  };

  render() {
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
                    !this.props.logged_in &&
                    <SignInPrompt
                      info_icon={this.props.sign_in_prompt_data.info_icon}
                      sign_in_url={this.props.sign_in_prompt_data.sign_in_url}
                    />
                  }
                  <EnrollForm
                    workshop_id={this.props.workshop.id}
                    logged_in={this.props.logged_in}
                    user_email={this.props.user_email}
                    enrollment_email={this.props.enrollment.email}
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
