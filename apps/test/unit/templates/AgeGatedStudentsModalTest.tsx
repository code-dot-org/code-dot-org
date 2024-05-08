import {render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import manageStudents, {
  RowType,
  setLoginType,
  setStudents,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import AgeGatedStudentsModal from '@cdo/apps/templates/teacherDashboard/AgeGatedStudentsModal';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

import {expect} from '../../util/reconfiguredChai';

describe('AgeGatedStudentsModal', () => {
  const fakeStudent = {
    id: 1,
    name: 'Clark Kent',
    username: 'clark_kent',
    sectionId: 101,
    hasEverSignedIn: true,
    dependsOnThisSectionForLogin: true,
    loginType: 'picture',
    rowType: RowType.STUDENT,
    age: 10,
    atRiskAgeGatedStudent: true,
    childAccountComplianceState: 'l',
  };
  const fakeStudents = {
    [fakeStudent.id]: fakeStudent,
  };
  const fakeSection = {
    id: 101,
    location: '/v2/sections/101',
    name: 'My Section',
    login_type: SectionLoginType.picture,
    participant_type: 'student',
    grade: '2',
    code: 'PMTKVH',
    lesson_extras: false,
    pairing_allowed: true,
    sharing_disabled: false,
    script: null,
    course_id: 29,
    studentCount: 10,
    students: Object.values(fakeStudents),
    hidden: false,
  };
  beforeEach(() => {
    stubRedux();
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

  afterEach(() => {
    restoreRedux();
  });

  it('should show a sync results view', () => {
    const {getByTestId} = render(
      <Provider store={getStore()}>
        <AgeGatedStudentsModal
          manageStudents={{isLoadingStudents: false}}
          onClose={() => {}}
          isOpen={true}
        />
      </Provider>
    );
    expect(getByTestId('age-gated-students-modal'));
  });
});
