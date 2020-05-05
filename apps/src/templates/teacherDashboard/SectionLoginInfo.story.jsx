import React from 'react';
import SectionLoginInfo from './SectionLoginInfo';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import teacherSections, {
  setSections
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import manageStudents, {
  setLoginType,
  setStudents
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';

export default storybook => {
  storybook = storybook.storiesOf('SectionLoginInfo', module);

  const store = createStore(
    combineReducers({
      teacherSections,
      manageStudents,
      sectionData,
      scriptSelection
    })
  );

  const fakeStudent = {
    id: 1,
    name: 'Clark Kent',
    username: 'clark_kent',
    sectionId: 101,
    hasEverSignedIn: true,
    dependsOnThisSectionForLogin: true,
    loginType: 'clever'
  };

  const fakeStudents = {
    [fakeStudent.id]: fakeStudent
  };

  const fakeSection = {
    id: 101,
    location: '/v2/sections/101',
    name: 'My Section',
    login_type: 'clever',
    grade: '2',
    code: 'PMTKVH',
    stage_extras: false,
    pairing_allowed: true,
    sharing_disabled: false,
    script: null,
    course_id: 29,
    studentCount: 10,
    students: Object.values(fakeStudents),
    hidden: false
  };

  store.dispatch(setLoginType(fakeSection.login_type));
  store.dispatch(setSections([fakeSection]));
  store.dispatch(setSection(fakeSection));
  store.dispatch(setStudents(fakeStudents));

  Object.values(SectionLoginType).forEach(loginType => {
    storybook.add(loginType, () => (
      <Provider store={store}>
        <SectionLoginInfo studioUrlPrefix="http://localhost-studio.code.org:3000" />
      </Provider>
    ));
  });
};
