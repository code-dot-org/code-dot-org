import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import SectionTable from './SectionTable';
import teacherSections, {
  setValidLoginTypes,
  setValidGrades,
  setValidCourses,
  setValidScripts
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const sections = [
  {
    id: 11,
    course_id: 29,
    script_id: null,
    name: "brent_section",
    loginType: "word",
    grade: null,
    stageExtras: false,
    pairingAllowed: true,
    numStudents: 10,
    code: "PMTKVH",
    assignmentName: "CS Discoveries",
    assignmentPath: "//localhost-studio.code.org:3000/courses/csd"
  },
  {
    id: 12,
    course_id: null,
    script_id: 36,
    name: "section2",
    loginType: "picture",
    grade: "11",
    stageExtras: false,
    pairingAllowed: true,
    numStudents: 1,
    code: "DWGMFX",
    assignmentName: "Course 3",
    assignmentPath: "//localhost-studio.code.org:3000/s/course3"
  },
  {
    id: 307,
    course_id: null,
    script_id: 46,
    name: "plc",
    loginType: "email",
    grade: "10",
    stageExtras: false,
    pairingAllowed: true,
    numStudents: 0,
    code: "WGYXTR",
    assignmentName: "Infinity Play Lab",
    assignmentPath: "//localhost-studio.code.org:3000/s/infinity"
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
          store.dispatch(setValidCourses(validCourses));
          store.dispatch(setValidScripts(validScripts));
          return (
            <Provider store={store}>
              <SectionTable
                sections={sections}
              />
            </Provider>
          );
        }
      }
    ]);
};
