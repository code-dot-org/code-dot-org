import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import SectionTable from './SectionTable';
import teacherSections, {
  setValidLoginTypes,
  setValidGrades,
  setValidAssignments,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const serverSections = [
  {
    id: 11,
    location: "/v2/sections/11",
    name: "brent_section",
    loginType: "picture",
    grade: "2",
    code: "PMTKVH",
    stageExtras: false,
    pairingAllowed: true,
    scriptId: null,
    courseId: 29,
    studentCount: 10,
  },
  {
    id: 12,
    location: "/v2/sections/12",
    name: "section2",
    loginType: "picture",
    grade: "11",
    code: "DWGMFX",
    stageExtras: false,
    pairingAllowed: true,
    scriptId: 36,
    courseId: null,
    studentCount: 1,
  },
  {
    id: 307,
    location: "/v2/sections/307",
    name: "plc",
    loginType: "email",
    grade: "10",
    code: "WGYXTR",
    stageExtras: true,
    pairingAllowed: false,
    scriptId: 46,
    courseId: null,
    studentCount: 0,
  }
];

const validCourses = [
  {
    id: 29,
    name: "CS Discoveries",
    script_name: "csd",
    category: "Full Courses",
    position: 1,
    category_priority: -1,
  },
  {
    id: 30,
    name: "CS Principles",
    script_name: "csp",
    category: "Full Courses",
    position: 0,
    category_priority: -1,
  }];

  const validScripts = [
  {
    id: 1,
    name: "Accelerated Course",
    script_name: "20-hour",
    category: "CS Fundamentals",
    position: 0,
    category_priority: 0,
  },
  {
    id: 2,
    name: "Hour of Code *",
    script_name: "Hour of Code",
    category: "Hour of Code",
    position: 1,
    category_priority: 0,
  },
  {
    id: 3,
    name: "edit-code *",
    script_name: "edit-code",
    category: "other",
    position: null,
    category_priority: 3,
  },
  {
    id: 4,
    name: "events *",
    script_name: "events",
    category: "other",
    position: null,
    category_priority: 3,
  },
  {
    id: 36,
    name: "Course 3",
    script_name: "course3",
    category: "CS Fundamentals",
    position: 3,
    category_priority: 0,
  },
  {
    id: 46,
    name: "Infinity Play Lab",
    script_name: "infinity",
    category: "Hour of Code",
    position: 12,
    category_priority: 0,
  }
];

export default storybook => {
  storybook
    .storiesOf('SectionTable (teacher dashboard)', module)
    .addStoryTable([
      {
        name: 'section table',
        story: () => {
          const store = createStore(combineReducers({teacherSections}));
          store.dispatch(setValidLoginTypes(['word', 'email', 'picture']));
          store.dispatch(setValidGrades(["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Other"]));
          store.dispatch(setValidAssignments(validCourses, validScripts));
          store.dispatch(setSections(serverSections));
          return (
            <Provider store={store}>
              <SectionTable/>
            </Provider>
          );
        }
      }
    ]);
};
