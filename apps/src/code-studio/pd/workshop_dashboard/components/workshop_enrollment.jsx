/**
 * Displays nicely-formatted session time for a workshop.
 */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import {enrollmentShape} from '../types';

import WorkshopEnrollmentSchoolInfo from './workshop_enrollment_school_info';

export default class WorkshopEnrollment extends React.Component {
  static propTypes = {
    enrollments: PropTypes.arrayOf(enrollmentShape).isRequired,
    workshopId: PropTypes.string.isRequired,
    workshopCourse: PropTypes.string.isRequired,
    workshopSubject: PropTypes.string,
    workshopDate: PropTypes.string.isRequired,
    numSessions: PropTypes.number.isRequired,
    accountRequiredForAttendance: PropTypes.bool.isRequired,
    scholarshipWorkshop: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClickSelect: PropTypes.func.isRequired,
    location: PropTypes.object,
    selectedEnrollments: PropTypes.array,
  };

  render() {
    if (this.props.enrollments.length === 0) {
      const signupUrl =
        location.origin +
        '/professional-learning/workshops/' +
        this.props.workshopId;
      const signupLink = (
        <a href={signupUrl} target="_blank" rel="noopener noreferrer">
          {signupUrl}
        </a>
      );
      return (
        <div>
          No one is currently signed up for your workshop. Share your workshop
          sign-up link {signupLink} for teachers to enroll.
        </div>
      );
    }

    const sortedEnrollments = _.sortBy(this.props.enrollments, [
      'last_name',
      'first_name',
    ]);
    return (
      <WorkshopEnrollmentSchoolInfo
        enrollments={sortedEnrollments}
        accountRequiredForAttendance={this.props.accountRequiredForAttendance}
        scholarshipWorkshop={this.props.scholarshipWorkshop}
        onDelete={this.props.onDelete}
        onClickSelect={this.props.onClickSelect}
        workshopCourse={this.props.workshopCourse}
        workshopSubject={this.props.workshopSubject}
        numSessions={this.props.numSessions}
        selectedEnrollments={this.props.selectedEnrollments}
      />
    );
  }
}
