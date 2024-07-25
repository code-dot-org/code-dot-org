import {render, fireEvent} from '@testing-library/react';
import React, {useState} from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import manageStudents, {
  RowType,
  setLoginType,
  setStudents,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import AgeGatedStudentsModal from '@cdo/apps/templates/policy_compliance/AgeGatedStudentsModal/AgeGatedStudentsModal';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('AgeGatedStudentsModal', () => {
  const fakeStudent = {
    id: 1,
    name: 'Clark Kent',
    username: 'clark_kent',
    sectionId: 101,
    hasEverSignedIn: true,
    dependsOnThisSectionForLogin: true,
    loginType: 'google_oauth2',
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
    login_type: 'google_oauth2',
    participant_type: 'student',
    grade: '2',
    code: 'PMTKVH',
    lesson_extras: false,
    pairing_allowed: true,
    sharing_disabled: false,
    script: null,
    course_id: 29,
    studentCount: 1,
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
      currentUser,
    });
    store.dispatch(setLoginType(fakeSection.login_type));
    store.dispatch(setSections([fakeSection]));
    store.dispatch(selectSection(fakeSection.id));
    store.dispatch(setStudents(fakeStudents));
  });

  it('should show a age gated students modal', () => {
    const {getByTestId} = render(
      <Provider store={getStore()}>
        <AgeGatedStudentsModal onClose={() => {}} isOpen={true} />
      </Provider>
    );
    expect(getByTestId('age-gated-students-modal'));
  });

  it('should close age gated students modal on close button press', () => {
    const WrapperComponent: React.FC = () => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <div>
          <AgeGatedStudentsModal
            onClose={() => setIsOpen(false)}
            isOpen={isOpen}
          />
        </div>
      );
    };

    const {queryByTestId, getByTestId, getByText} = render(
      <Provider store={getStore()}>
        <WrapperComponent />
      </Provider>
    );
    expect(getByTestId('age-gated-students-modal'));
    const button = getByText(i18n.closeDialog());
    fireEvent.click(button);
    const ageGatedTable = queryByTestId('age-gated-students-modal');
    expect(ageGatedTable).to.not.exist;
  });
});
