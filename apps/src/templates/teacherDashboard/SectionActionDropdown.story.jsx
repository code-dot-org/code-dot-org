import React from 'react';
import SectionActionDropdown from './SectionActionDropdown';
import { combineReducers, createStore } from 'redux';
import teacherSections, { setSections } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import { Provider } from 'react-redux';

const sectionDataHidden = {
  id: 1,
  name: 'NAME',
  loginType: "email",
  studentCount: 0,
  code: "RGRBJT",
  grade: "12",
  providerManaged: false,
  hidden: true,
  assignmentNames: ["Course A"],
  assignmentPath: ["/s/coursea"],
};

const sectionDataShown = {
  id: 2,
  name: 'NAME',
  loginType: "email",
  studentCount: 0,
  code: "RGRBJT",
  grade: "12",
  providerManaged: false,
  hidden: false,
  assignmentNames: ["Course A"],
  assignmentPath: ["/s/coursea"],
};

const sectionDataNotEmpty = {
  id: 3,
  name: 'NAME',
  loginType: "email",
  studentCount: 3,
  code: "RGRBJT",
  grade: "12",
  providerManaged: false,
  hidden: false,
  assignmentNames: ["Course A"],
  assignmentPath: ["/s/coursea"],
};

export default storybook => {
  storybook
    .storiesOf('SectionActionDropdown', module)
    .addStoryTable([
      {
        name: 'Archived Section',
        description: 'Should have "Restore Section" option',
        story: () => {
          const store = createStore(combineReducers({teacherSections}));
          store.dispatch(setSections([sectionDataHidden]));
          return (
            <Provider store={store}>
              <SectionActionDropdown
                sectionData = {sectionDataHidden}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Shown Section',
        description: 'Should have "Restore Section" option',
        story: () => {
          const store = createStore(combineReducers({teacherSections}));
          store.dispatch(setSections([sectionDataShown]));
          return (
            <Provider store={store}>
              <SectionActionDropdown
                sectionData={sectionDataShown}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Not-Empty Class',
        description: 'studentCount > 0, show "Archive Section" option',
        story: () => {
          const store = createStore(combineReducers({teacherSections}));
          store.dispatch(setSections([sectionDataNotEmpty]));
          return (
            <Provider store={store}>
              <SectionActionDropdown
                sectionData={sectionDataNotEmpty}
              />
            </Provider>
          );
        }
      },
    ]);
};
