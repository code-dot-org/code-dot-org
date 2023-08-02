import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import OwnedSectionsTable from './OwnedSectionsTable';
import teacherSections, {
  setCourseOfferings,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

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
    hidden: false,
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
      name: 'course3',
    },
    course_id: null,
    studentCount: 1,
    hidden: false,
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
      name: 'course3',
    },
    course_id: null,
    studentCount: 5,
    hidden: false,
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
      name: 'course3',
    },
    course_id: null,
    studentCount: 4,
    hidden: false,
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
      name: 'infinity',
    },
    course_id: null,
    studentCount: 0,
    hidden: false,
  },
];

export default {
  name: 'OwnedSectionsTable (teacher dashboard)',
  component: OwnedSectionsTable,
};

export const SectionTable = () => {
  const store = createStore(combineReducers({teacherSections}));
  store.dispatch(setCourseOfferings(courseOfferings));
  store.dispatch(setSections(serverSections));
  return (
    <Provider store={store}>
      <OwnedSectionsTable
        sectionIds={[11, 12, 20, 21, 307]}
        onEdit={() => {}}
      />
    </Provider>
  );
};
