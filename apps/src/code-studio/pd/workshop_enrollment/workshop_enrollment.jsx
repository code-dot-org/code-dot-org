/**
 * New workshop enrollment page
 */
import React, {PropTypes} from 'react';
import WorkshopDetails from './workshop_details';

export default class WorkshopEnrollment extends React.Component {
  static propTypes = {
    workshop: PropTypes.object,
    enrollment: PropTypes.object,
    session_dates: PropTypes.arrayOf(PropTypes.string)
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
            {/* Left Column*/}
            <div className ="span6">
              <WorkshopDetails
                workshop={this.props.workshop}
                sessionDates={this.props.session_dates}
              />

              <h2>Facilitators</h2>

            </div>
            {/* Right Column*/}
            <div className ="span6">
              <div className="row">
                <div className ="span6">
                  <h2>Your Information</h2>

                  <h2>Enrollment Form Here</h2>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
