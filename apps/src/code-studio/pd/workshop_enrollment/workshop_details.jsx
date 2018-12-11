/**
 * Workshop Details section of the workshop enrollment form
 */
import React, {PropTypes} from 'react';
import {WorkshopPropType} from './enrollmentConstants';

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
    workshop: WorkshopPropType,
    session_dates: PropTypes.arrayOf(PropTypes.string)
  };

  workshopCourse() {
    if (this.props.workshop.course_url) {
      return (
        <a href={this.props.workshop.course_url}>
          {this.props.workshop.course}
        </a>
      );
    } else {
      return this.props.workshop.course;
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
            {this.props.session_dates.length === 1 ? 'Date:' : 'Dates:'}
          </strong>
        </div>
        <div className="span4">
          {this.props.session_dates.map(date => (
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

  courseAndSubject() {
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
          {this.props.workshop.subject}
        </div>
      </div>
    );
  }

  regionalPartner() {
    if (this.props.workshop.regional_partner) {
      return (
        <div className="row">
          <div
            className="span2"
            style={styles.label}
          >
            <strong>RegionalPartner:</strong>
          </div>
          <div className="span2">
            {this.props.workshop.regional_partner.name}
          </div>
        </div>
      );
    }
  }

  organizerAndNotes() {
    return (
      <div>
        <div className="row">
          <div
            className="span2"
            style={styles.label}
          >
            <strong>Organizer Name:</strong>
          </div>
          <div className="span2">
            {this.props.workshop.organizer.name}
          </div>
        </div>
        <div className="row">
          <div
            className="span2"
            style={styles.label}
          >
            <strong>Organizer Email:</strong>
          </div>
          <div className="span2">
            {this.props.workshop.organizer.email}
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
        {this.courseAndSubject()}
        {this.regionalPartner()}
        {this.organizerAndNotes()}
      </div>
    );
  }
}
