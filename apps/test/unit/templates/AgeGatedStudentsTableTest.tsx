import {render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import manageStudents, {
  RowType,
  setLoginType,
  setStudents,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import AgeGatedStudentsTable from '@cdo/apps/templates/policy_compliance/AgeGatedStudentsModal/AgeGatedStudentsTable';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {ChildAccountComplianceStates} from '@cdo/generated-scripts/sharedConstants';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('AgeGatedStudentsTable', () => {
  const fakeStudent = {
    id: 1,
    name: 'Clark Kent',
    username: 'clark_kent',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState: ChildAccountComplianceStates.LOCKED_OUT,
    latestPermissionRequestSentAt: null,
  };
  const fakeStudent2 = {
    id: 2,
    name: 'Joe Smith',
    username: 'joe_smith',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: false,
    childAccountComplianceState: '',
    latestPermissionRequestSentAt: null,
  };
  const fakeStudent3 = {
    id: 3,
    name: 'test student',
    username: 'test_student3',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState: ChildAccountComplianceStates.GRACE_PERIOD,
    latestPermissionRequestSentAt: new Date(),
  };
  const fakeStudent4 = {
    id: 4,
    name: 'fake student',
    username: 'fake_student4',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState:
      ChildAccountComplianceStates.PERMISSION_GRANTED,
    latestPermissionRequestSentAt: new Date(),
  };
  const fakeStudent5 = {
    id: 5,
    name: 'Kent Clark',
    username: 'fake_student5',
    sectionId: 101,
    hasEverSignedIn: false,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState: '',
    latestPermissionRequestSentAt: null,
  };
  const fakeStudents = {
    [fakeStudent.id]: fakeStudent,
    [fakeStudent2.id]: fakeStudent2,
    [fakeStudent3.id]: fakeStudent3,
    [fakeStudent4.id]: fakeStudent4,
    [fakeStudent5.id]: fakeStudent5,
  };
  const fakeSection = {
    id: 101,
    location: '/v2/sections/101',
    name: 'My Section',
    login_type: 'google_oauth2',
    participant_type: 'student',
    grade: '2',
    code: 'PMTKVH',
    lesson_extras: false,
    pairing_allowed: true,
    sharing_disabled: false,
    script: null,
    course_id: 29,
    studentCount: 5,
    students: Object.values(fakeStudents),
    hidden: false,
  };

  beforeEach(() => {
    const store = getStore();
    registerReducers({
      teacherSections,
      manageStudents,
      isRtl,
      unitSelection,
    });
    store.dispatch(setLoginType(fakeSection.login_type));
    store.dispatch(setSections([fakeSection]));
    store.dispatch(selectSection(fakeSection.id));
    store.dispatch(setStudents(fakeStudents));
  });

  it('should show table with students', () => {
    const {getByTestId} = render(
      <Provider store={getStore()}>
        <AgeGatedStudentsTable />
      </Provider>
    );

    const table = getByTestId('uitest-age-gated-students-table');
    const theadCellText = (col: number) =>
      table.querySelector(`thead th:nth-child(${col})`)?.textContent;
    const tbodyCellText = (row: number, col: number) =>
      table.querySelector(`tbody > tr:nth-child(${row}) > td:nth-child(${col})`)
        ?.textContent;

    // 4 age gated student rows
    expect(table.querySelectorAll('tbody > tr').length).to.equal(4);

    // Header
    expect(theadCellText(1)).to.contain('Student Name');
    expect(theadCellText(2)).to.contain('Consent Status');
    expect(theadCellText(3)).to.contain('Parent/Guardian Emailed?');

    // Kent Clark
    expect(tbodyCellText(1, 1)).to.contain(fakeStudent5.name);
    expect(tbodyCellText(1, 2)).to.contain('Not Started');
    expect(tbodyCellText(1, 3)).to.contain('No');

    // fake student
    expect(tbodyCellText(2, 1)).to.contain(fakeStudent4.name);
    expect(tbodyCellText(2, 2)).to.contain('Permission Granted');
    expect(tbodyCellText(2, 3)).to.contain('Yes');

    // test student
    expect(tbodyCellText(3, 1)).to.contain(fakeStudent3.name);
    expect(tbodyCellText(3, 2)).to.contain('Pending Lockout');
    expect(tbodyCellText(3, 3)).to.contain('Yes');

    // Clark Kent
    expect(tbodyCellText(4, 1)).to.contain(fakeStudent.name);
    expect(tbodyCellText(4, 2)).to.contain('Locked Out');
    expect(tbodyCellText(4, 3)).to.contain('No');
  });

  it('should not show table if no students', () => {
    const store = getStore();
    store.dispatch(setSections([]));
    store.dispatch(setStudents({}));
    const {queryByTestId} = render(
      <Provider store={getStore()}>
        <AgeGatedStudentsTable />
      </Provider>
    );
    const ageGatedTable = queryByTestId('uitest-age-gated-students-table');
    expect(ageGatedTable).to.not.exist;
  });
});
