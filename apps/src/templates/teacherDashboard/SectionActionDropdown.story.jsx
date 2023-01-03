import React from 'react';
import SectionActionDropdown from './SectionActionDropdown';
import {combineReducers, createStore} from 'redux';
import teacherSections, {
  setSections
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';

const sectionDataHidden = {
  id: 1,
  name: 'NAME',
  loginType: 'email',
  studentCount: 0,
  code: 'RGRBJT',
  grade: '12',
  providerManaged: false,
  hidden: true,
  assignmentNames: ['Course A'],
  assignmentPath: ['/s/coursea']
};

const sectionDataShown = {
  id: 2,
  name: 'NAME',
  loginType: 'email',
  studentCount: 0,
  code: 'RGRBJT',
  grade: '12',
  providerManaged: false,
  hidden: false,
  assignmentNames: ['Course A'],
  assignmentPath: ['/s/coursea']
};

const sectionDataNotEmpty = {
  id: 3,
  name: 'NAME',
  loginType: 'email',
  studentCount: 3,
  code: 'RGRBJT',
  grade: '12',
  providerManaged: false,
  hidden: false,
  assignmentNames: ['Course A'],
  assignmentPath: ['/s/coursea']
};

export default {
  title: 'SectionActionDropdown',
  component: SectionActionDropdown
};

const Template = args => {
  const store = createStore(combineReducers({teacherSections}));
  store.dispatch(setSections([args.sectionData]));
  return (
    <Provider store={store}>
      <SectionActionDropdown sectionData={args.sectionData} />
    </Provider>
  );
};

// Should have "Restore Section" option
export const ArchivedSection = Template.bind({});
ArchivedSection.args = {sectionData: sectionDataHidden};

// Should not have "Restore Section" option
export const ShownSection = Template.bind({});
ShownSection.args = {sectionData: sectionDataShown};

// studentCount > 0, show "Archive Section" option
export const NotEmptyClass = Template.bind({});
NotEmptyClass.args = {sectionData: sectionDataNotEmpty};
