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
import AgeGatedStudentsTable from '@cdo/apps/templates/teacherDashboard/AgeGatedStudentsTable';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {ChildAccountComplianceStates} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {expect} from '../../util/reconfiguredChai';

interface FakeStudent {
  id: number;
  name: string;
  username: string;
  sectionId: number;
  hasEverSignedIn: boolean;
  dependsOnThisSectionForLogin: boolean;
  loginType: string;
  rowType: string;
  age: number;
  atRiskAgeGatedStudent: boolean;
  childAccountComplianceState: string;
}

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
    childAccountComplianceState: 'l',
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
    childAccountComplianceState: 's',
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
    childAccountComplianceState: 'g',
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

  const getConsentStatus = (consentStatus: string) => {
    switch (consentStatus) {
      case ChildAccountComplianceStates.LOCKED_OUT:
        return i18n.childAccountPolicy_lockedOut();
      case ChildAccountComplianceStates.REQUEST_SENT:
        return i18n.childAccountPolicy_requestSent();
      case ChildAccountComplianceStates.PERMISSION_GRANTED:
        return i18n.childAccountPolicy_permissionGranted();
      default:
        return i18n.childAccountPolicy_notStarted();
    }
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
    const {getByText, getByTestId, queryByText} = render(
      <Provider store={getStore()}>
        <AgeGatedStudentsTable />
      </Provider>
    );
    expect(getByTestId('uitest-age-gated-students-table'));

    Object.values(fakeStudents).forEach((student: FakeStudent) => {
      if (student.atRiskAgeGatedStudent) {
        expect(getByText(student.name));
        expect(
          getByText(getConsentStatus(student.childAccountComplianceState))
        );
      } else {
        expect(queryByText(student.name)).to.not.exist;
      }
    });
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
