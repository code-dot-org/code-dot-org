import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import OwnedSectionsTable from './OwnedSectionsTable';
import teacherSections, {
  setValidGrades,
  setValidAssignments,
  setSections
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const serverSections = [
  {
    id: 11,
    location: '/v2/sections/11',
    name: 'brent_section',
    login_type: 'picture',
    grade: '2',
    code: 'PMTKVH',
    lesson_extras: false,
    pairing_allowed: true,
    script: null,
    course_id: 29,
    studentCount: 10,
    hidden: false
  },
  {
    id: 12,
    location: '/v2/sections/12',
    name: 'section2',
    login_type: 'picture',
    grade: '11',
    code: 'DWGMFX',
    lesson_extras: false,
    pairing_allowed: true,
    script: {
      id: 36,
      name: 'course3'
    },
    course_id: null,
    studentCount: 1,
    hidden: false
  },
  {
    id: 20,
    location: '/v2/sections/20',
    name: 'imported_section',
    login_type: 'clever',
    grade: null,
    providerManaged: true,
    code: 'C-1234567890',
    lesson_extras: true,
    pairing_allowed: true,
    script: {
      id: 36,
      name: 'course3'
    },
    course_id: null,
    studentCount: 5,
    hidden: false
  },
  {
    id: 21,
    location: '/v2/sections/21',
    name: 'imported_section_2',
    login_type: 'google_classroom',
    grade: '7',
    providerManaged: true,
    code: 'G-12345',
    lesson_extras: true,
    pairing_allowed: true,
    script: {
      id: 36,
      name: 'course3'
    },
    course_id: null,
    studentCount: 4,
    hidden: false
  },
  {
    id: 307,
    location: '/v2/sections/307',
    name: 'plc',
    login_type: 'email',
    grade: '10',
    code: 'WGYXTR',
    lesson_extras: true,
    pairing_allowed: false,
    script: {
      id: 46,
      name: 'infinity'
    },
    course_id: null,
    studentCount: 0,
    hidden: false
  }
];

const validCourses = [
  {
    id: 29,
    name: 'CS Discoveries',
    script_name: 'csd',
    category: 'Full Courses',
    position: 1,
    category_priority: 0
  },
  {
    id: 30,
    name: 'CS Principles',
    script_name: 'csp',
    category: 'Full Courses',
    position: 0,
    category_priority: 0
  }
];

const validScripts = [
  {
    id: 1,
    name: 'Accelerated Course',
    script_name: '20-hour',
    category: 'CS Fundamentals International',
    position: 0,
    category_priority: 3
  },
  {
    id: 2,
    name: 'Hour of Code *',
    script_name: 'Hour of Code',
    category: 'Hour of Code',
    position: 1,
    category_priority: 2
  },
  {
    id: 3,
    name: 'edit-code *',
    script_name: 'edit-code',
    category: 'other',
    position: null,
    category_priority: 15
  },
  {
    id: 4,
    name: 'events *',
    script_name: 'events',
    category: 'other',
    position: null,
    category_priority: 15
  },
  {
    id: 36,
    name: 'Course 3',
    script_name: 'course3',
    category: 'CS Fundamentals',
    position: 3,
    category_priority: 3
  },
  {
    id: 46,
    name: 'Infinity Play Lab',
    script_name: 'infinity',
    category: 'Hour of Code',
    position: 12,
    category_priority: 2
  }
];

export default storybook => {
  storybook
    .storiesOf('OwnedSectionsTable (teacher dashboard)', module)
    .addStoryTable([
      {
        name: 'section table',
        story: () => {
          const store = createStore(combineReducers({teacherSections}));
          store.dispatch(
            setValidGrades([
              'K',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '10',
              '11',
              '12',
              'Other'
            ])
          );
          store.dispatch(setValidAssignments(validCourses, validScripts));
          store.dispatch(setSections(serverSections));
          return (
            <Provider store={store}>
              <OwnedSectionsTable
                sectionIds={[11, 12, 20, 21, 307]}
                onEdit={() => {}}
              />
            </Provider>
          );
        }
      }
    ]);
};
