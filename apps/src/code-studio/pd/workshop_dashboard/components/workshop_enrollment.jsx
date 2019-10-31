/**
 * Displays nicely-formatted session time for a workshop.
 */
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {Tabs, Tab} from 'react-bootstrap';
import {enrollmentShape} from '../types';
import WorkshopEnrollmentSchoolInfo from './workshop_enrollment_school_info';
import WorkshopEnrollmentPreSurvey from './workshop_enrollment_pre_survey';

export default class WorkshopEnrollment extends React.Component {
  static propTypes = {
    enrollments: PropTypes.arrayOf(enrollmentShape).isRequired,
    workshopId: PropTypes.string.isRequired,
    workshopCourse: PropTypes.string.isRequired,
    workshopSubject: PropTypes.string.isRequired,
    workshopDate: PropTypes.string.isRequired,
    numSessions: PropTypes.number.isRequired,
    accountRequiredForAttendance: PropTypes.bool.isRequired,
    scholarshipWorkshop: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClickSelect: PropTypes.func.isRequired,
    location: PropTypes.object,
    activeTab: PropTypes.number,
    onTabSelect: PropTypes.func,
    selectedEnrollments: PropTypes.array
  };

  static defaultProps = {activeTab: 0};

  shouldShowPreSurveys() {
    return ['CS Discoveries', 'CS Principles'].includes(
      this.props.workshopCourse
    );
  }

  render() {
    if (this.props.enrollments.length === 0) {
      const signupUrl =
        location.origin + '/pd/workshops/' + this.props.workshopId + '/enroll';
      const signupLink = (
        <a href={signupUrl} target="_blank">
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
      'first_name'
    ]);
    const workshopEnrollmentSchoolInfo = (
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

    if (this.shouldShowPreSurveys()) {
      return (
        <Tabs
          activeKey={this.props.activeTab}
          onSelect={this.props.onTabSelect}
          id="enrollment-tabs"
        >
          <Tab eventKey={0} title="Attendee School Info">
            {workshopEnrollmentSchoolInfo}
          </Tab>
          <Tab eventKey={1} title="Attendee Pre-Survey">
            <WorkshopEnrollmentPreSurvey
              enrollments={sortedEnrollments}
              workshopDate={this.props.workshopDate}
            />
          </Tab>
        </Tabs>
      );
    } else {
      return workshopEnrollmentSchoolInfo;
    }
  }
}
