import {WorkshopEnrollmentSchoolInfo} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_enrollment_school_info';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';

describe('Workshop Enrollment School Info', () => {
  const fakeRouter = {
    createHref() {}
  };

  const context = {
    router: fakeRouter
  };

  it('shows Total Attendance column for local summer workshop', () => {
    let workshopEnrollmentSchoolInfo = shallow(
      <WorkshopEnrollmentSchoolInfo
        enrollments={[]}
        accountRequiredForAttendance={true}
        onDelete={() => {}}
        workshopCourse="CS Principles"
        workshopSubject="5-day Summer"
        numSessions={5}
      />,
      {context}
    );

    expect(
      workshopEnrollmentSchoolInfo
        .find('th')
        .filterWhere(col => col.text().includes('Total Attendance'))
    ).to.have.length(1);
  });
});
