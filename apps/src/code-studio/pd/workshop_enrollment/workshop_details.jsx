/**
 * Workshop Details section of the workshop enrollment form
 */
import PropTypes from 'prop-types';
import React from 'react';

import {WorkshopFormats} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {COURSE_BUILD_YOUR_OWN} from '../workshop_dashboard/workshopConstants';

import {WorkshopPropType} from './enrollmentConstants';

export default class WorkshopDetails extends React.Component {
  static propTypes = {
    workshop: WorkshopPropType,
    session_dates: PropTypes.arrayOf(PropTypes.string),
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
        <div className="span2" style={styles.label}>
          <strong>
            {this.props.session_dates.length === 1 ? 'Date:' : 'Dates:'}
          </strong>
        </div>
        <div className="span4">
          {this.props.session_dates.map(date => (
            <div key={date}>
              {date}
              <br />
            </div>
          ))}
        </div>
      </div>
    );
  }

  format() {
    return (
      <>
        <div className="row">
          <div className="span2" style={styles.label}>
            <strong>Format:</strong>
          </div>
          <div className="span2">{this.props.workshop.format}</div>
        </div>
        {[WorkshopFormats.in_person, WorkshopFormats.hybrid].includes(
          this.props.workshop.format
        ) && this.location()}
      </>
    );
  }

  location() {
    return (
      <>
        <div className="row">
          <div className="span2" style={styles.label}>
            <strong>Location Name:</strong>
          </div>
          <div className="span2">{this.props.workshop.location_name}</div>
        </div>
        {this.props.workshop.location_address && (
          <div className="row">
            <div className="span2" style={styles.label}>
              <strong>Location Address:</strong>
            </div>
            <div className="span2">
              <div>{this.props.workshop.location_address}</div>
            </div>
          </div>
        )}
      </>
    );
  }

  courseAndSubject() {
    return (
      <div className="row">
        <div className="span2" style={styles.label}>
          <strong>Course:</strong>
        </div>
        <div className="span2">
          {this.workshopCourse()}
          <br />
          {this.props.workshop.subject}
          <br />
          {this.props.workshop.module}
        </div>
      </div>
    );
  }

  buildYourOwnWSDetails() {
    return (
      <>
        {this.props.workshop.name && (
          <div className="row">
            <div className="span2" style={styles.label}>
              <strong>Workshop Name:</strong>
            </div>
            <div className="span2">{this.props.workshop.name}</div>
          </div>
        )}
        <div className="row">
          <div className="span2" style={styles.label}>
            <strong>Topics:</strong>
          </div>
          <div className="span2">
            {this.props.workshop.course_offerings.map(topic => (
              <div key={topic.key}>{topic.display_name}</div>
            ))}
          </div>
        </div>
      </>
    );
  }

  fee() {
    if (this.props.workshop.course === 'CS Fundamentals') {
      return (
        <div className="row">
          <div className="span2" style={styles.label}>
            <strong>Fee:</strong>
          </div>
          <div className="span2">{this.props.workshop.fee || 'No cost!'}</div>
        </div>
      );
    }

    return null;
  }

  regionalPartner() {
    if (this.props.workshop.regional_partner) {
      return (
        <div className="row">
          <div className="span2" style={styles.label}>
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
          <div className="span2" style={styles.label}>
            <strong>Organizer Name:</strong>
          </div>
          <div className="span2">{this.props.workshop.organizer.name}</div>
        </div>
        <div className="row">
          <div className="span2" style={styles.label}>
            <strong>Organizer Email:</strong>
          </div>
          <div className="span2">{this.props.workshop.organizer.email}</div>
          <div className="span6">
            <p style={styles.notes}>{this.props.workshop.notes}</p>
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
        {this.format()}
        {this.props.workshop.course === COURSE_BUILD_YOUR_OWN
          ? this.buildYourOwnWSDetails()
          : this.courseAndSubject()}
        {this.fee()}
        {this.regionalPartner()}
        {this.organizerAndNotes()}
      </div>
    );
  }
}

const styles = {
  label: {
    textAlign: 'right',
  },
  notes: {
    whiteSpace: 'pre-wrap',
  },
};
