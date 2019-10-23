import {WorkshopEnrollmentSchoolInfo} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_enrollment_school_info';
import Permission from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
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
        scholarshipWorkshop={true}
        onDelete={() => {}}
        onClickSelect={() => {}}
        workshopCourse="CS Principles"
        workshopSubject="5-day Summer"
        numSessions={5}
        permissionList={new Permission(['ProgramManager'])}
      />,
      {context}
    );

    expect(
      workshopEnrollmentSchoolInfo
        .find('th')
        .filterWhere(col => col.text().includes('Total Attendance'))
    ).to.have.length(1);
  });

  it('does not show Total Attendance column for non-local-summer workshop', () => {
    let workshopEnrollmentSchoolInfo = shallow(
      <WorkshopEnrollmentSchoolInfo
        enrollments={[]}
        accountRequiredForAttendance={true}
        scholarshipWorkshop={false}
        onDelete={() => {}}
        onClickSelect={() => {}}
        workshopCourse="CS Discoveries"
        workshopSubject="Workshop 1: Unit 3"
        numSessions={5}
        permissionList={new Permission(['ProgramManager'])}
      />,
      {context}
    );

    expect(
      workshopEnrollmentSchoolInfo
        .find('th')
        .filterWhere(col => col.text().includes('Total Attendance'))
    ).to.have.length(0);
  });

  it('shows Scholarship Teacher? column for scholarship workshop', () => {
    let workshopEnrollmentSchoolInfo = shallow(
      <WorkshopEnrollmentSchoolInfo
        enrollments={[]}
        accountRequiredForAttendance={true}
        scholarshipWorkshop={true}
        onDelete={() => {}}
        onClickSelect={() => {}}
        workshopCourse="CS Principles"
        workshopSubject="5-day Summer"
        numSessions={5}
        permissionList={new Permission(['ProgramManager'])}
      />,
      {context}
    );

    expect(
      workshopEnrollmentSchoolInfo
        .find('th')
        .filterWhere(col => col.text().includes('Scholarship Teacher?'))
    ).to.have.length(1);
  });

  it('does not show Scholarship Teacher? column for non-scholarship workshop', () => {
    let workshopEnrollmentSchoolInfo = shallow(
      <WorkshopEnrollmentSchoolInfo
        enrollments={[]}
        accountRequiredForAttendance={true}
        scholarshipWorkshop={false}
        onDelete={() => {}}
        onClickSelect={() => {}}
        workshopCourse="CS Discoveries"
        workshopSubject="Workshop 1: Unit 3"
        numSessions={5}
        permissionList={new Permission(['ProgramManager'])}
      />,
      {context}
    );

    expect(
      workshopEnrollmentSchoolInfo
        .find('th')
        .filterWhere(col => col.text().includes('Scholarship Teacher?'))
    ).to.have.length(0);
  });
});
