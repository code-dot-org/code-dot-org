/**
 * Workshop Details section of the workshop enrollment form
 */
import React, {PropTypes} from 'react';

const styles = {
  right: {
    textAlign: 'right'
  },
  notes: {
    whiteSpace: 'pre-wrap'
  }
};

export default class WorkshopDetails extends React.Component {
  static propTypes = {
    workshop: PropTypes.object
  };

  workshopCourse() {
    if (this.props.workshop.course_target) {
      return 'Link to workshop course and target';
    } else {
      return this.props.workshop.course;
    }
  }

  workshopSubject() {
    if (this.props.workshop.subject) {
      return this.props.workshop.subject;
    }
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="span6">
            <h2>Workshop Details</h2>
          </div>
        </div>
        <div className="row">
          <div
            className="span2"
            style={styles.right}
          >
            <strong>
              Session dates go here:
              {/*this.props.workshop.sessions.count == 1 ? 'Date:' : 'Dates:'*/}
            </strong>
          </div>
          <div className="span4">
            insert session date
            {/*this.props.workshop.sessions.forEach((session) => {
              session.
            })*/}
            {/* add a <br /> after each session's date */}
          </div>
        </div>
        <div className="row">
          <div
            className="span2"
            style={styles.right}
          >
            <strong>Location:</strong>
          </div>
          <div className="span2">
            {this.props.workshop.location_name}
            <br/>
            {this.props.workshop.location_address}
          </div>
        </div>
        <div className="row">
          <div
            className="span2"
            style={styles.right}
          >
            <strong>Course:</strong>
          </div>
          <div className="span2">
            {this.workshopCourse()}
            <br/>
            {this.workshopSubject()}
          </div>
          <div className="span6">
            <p style={styles.notes}>
              {this.props.workshop.notes}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
