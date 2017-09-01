/**
 * Displays nicely-formatted session time for a workshop.
*/
import React from 'react';
import _ from 'lodash';
import {Tabs, Tab} from 'react-bootstrap';
import {enrollmentShape} from "../types";
import WorkshopEnrollmentSchoolInfo from './workshop_enrollment_school_info';
import WorkshopEnrollmentPreSurvey from "./workshop_enrollment_pre_survey";

const WorkshopEnrollment = React.createClass({
  propTypes: {
    enrollments: React.PropTypes.arrayOf(enrollmentShape).isRequired,
    workshopId: React.PropTypes.string.isRequired,
    workshopCourse: React.PropTypes.string.isRequired,
    accountRequiredForAttendance: React.PropTypes.bool.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    location: React.PropTypes.object,
    activeTab: React.PropTypes.number,
    onTabSelect: React.PropTypes.func
  },

  getDefaultProps() {
    return {activeTab: 0};
  },

  shouldShowPreSurveys() {
    return ['CS Discoveries', 'CS Principles'].includes(this.props.workshopCourse);
  },

  render() {
    if (this.props.enrollments.length === 0) {
      const signupUrl = location.origin + "/pd/workshops/" + this.props.workshopId + '/enroll';
      const signupLink = <a href={signupUrl} target="_blank">{signupUrl}</a>;
      return (
        <div>
          No one is currently signed up for your workshop. Share your workshop sign-up
          link {signupLink} for teachers to enroll.
        </div>
      );
    }

    const sortedEnrollments = _.sortBy(this.props.enrollments, ['last_name', 'first_name']);

    if (this.shouldShowPreSurveys()) {
      return (
        <Tabs activeKey={this.props.activeTab} onSelect={this.props.onTabSelect} id="enrollment-tabs">
          <Tab eventKey={0} title="Attendee School Info">
            <WorkshopEnrollmentSchoolInfo
              enrollments={sortedEnrollments}
              accountRequiredForAttendance={this.props.accountRequiredForAttendance}
              onDelete={this.props.onDelete}
            />
          </Tab>
          <Tab eventKey={1} title="Attendee Pre-Survey">
            <WorkshopEnrollmentPreSurvey
              enrollments={sortedEnrollments}
            />
          </Tab>
        </Tabs>
      );
    } else {
      return (
        <WorkshopEnrollmentSchoolInfo
          enrollments={sortedEnrollments}
          accountRequiredForAttendance={this.props.accountRequiredForAttendance}
          onDelete={this.props.onDelete}
        />
      );
    }
  }
});

export default WorkshopEnrollment;
