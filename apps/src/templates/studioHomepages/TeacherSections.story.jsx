import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';

import teacherSections, {
  serverSectionFromSection,
  setSections,
} from '../teacherDashboard/teacherSectionsRedux';

import TeacherSections from './TeacherSections';

export default {
  component: TeacherSections,
};

const sections = [
  {
    id: 11,
    name: 'Algebra Period 1',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    studentCount: 14,
    linkToStudents: 'to Manage Students tab',
    loginType: 'word',
    code: 'ABCDEF',
    providerManaged: false,
    hidden: false,
  },
  {
    id: 12,
    name: 'Algebra Period 2',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    studentCount: 19,
    linkToStudents: 'to Manage Students tab',
    loginType: 'word',
    code: 'EEB206',
    providerManaged: false,
    hidden: false,
  },
  {
    id: 13,
    name: 'Period 3',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'Course 4',
    linkToAssigned: 'to Course',
    studentCount: 22,
    linkToStudents: 'to Manage Students tab',
    loginType: 'word',
    code: 'HPRWHG',
    providerManaged: false,
    hidden: false,
  },
];
const serverSections = sections.map(serverSectionFromSection);

export const TeacherAtLeastOneSection = () => {
  withFakeServer({sections: serverSections});
  registerReducers({teacherSections});
  const store = createStoreWithReducers();
  store.dispatch(setSections(serverSections));
  return (
    <Provider store={store}>
      <TeacherSections />
    </Provider>
  );
};

export const TeacherNoSections = () => {
  withFakeServer();
  registerReducers({teacherSections});
  const store = createStoreWithReducers();
  return (
    <Provider store={store}>
      <TeacherSections />
    </Provider>
  );
};

function withFakeServer({courses = [], sections = []} = {}) {
  const server = sinon.fakeServer.create({
    autoRespond: true,
  });
  const successResponse = body => [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify(body),
  ];
  server.respondWith(
    'GET',
    '/dashboardapi/sections',
    successResponse(sections)
  );
  server.respondWith(
    'GET',
    '/dashboardapi/sections/valid_course_offerings',
    successResponse([])
  );
  server.respondWith('GET', '/api/v1/section_instructors', successResponse([]));
}
