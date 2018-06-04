/**
 * Workshop Details section of the workshop enrollment form
 */
import React, {PropTypes} from 'react';

const styles = {
  label: {
    textAlign: 'right'
  },
  notes: {
    whiteSpace: 'pre-wrap'
  }
};

export default class WorkshopDetails extends React.Component {
  static propTypes = {
    workshop: PropTypes.object,
    sessionDates: PropTypes.arrayOf(PropTypes.string)
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

  sessionDates() {
    return (
      <div className="row">
        <div
          className="span2"
          style={styles.label}
        >
          <strong>
            {this.props.sessionDates.length === 1 ? 'Date:' : 'Dates:'}
          </strong>
        </div>
        <div className="span4">
          {this.props.sessionDates.map(date => (
            <div key={date}>
              {date}
              <br/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  location() {
    return (
      <div className="row">
        <div
          className="span2"
          style={styles.label}
        >
          <strong>Location:</strong>
        </div>
        <div className="span2">
          {this.props.workshop.location_name}
          <br/>
          {this.props.workshop.location_address}
        </div>
      </div>
    );
  }

  courseAndNotes() {
    return (
      <div className="row">
        <div
          className="span2"
          style={styles.label}
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
    );
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="span6">
            <h2>Workshop Details</h2>
          </div>
        </div>
        {this.sessionDates()}
        {this.location()}
        {this.courseAndNotes()}
      </div>
    );
  }
}
