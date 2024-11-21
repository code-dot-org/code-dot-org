import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';
import {reduxStore} from '@cdo/storybook/decorators';

import teacherSections, {
  setSections,
} from '../teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '../teacherDashboard/teacherSectionsReduxSelectors';

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
    participantType: ParticipantAudience.student,
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
    participantType: ParticipantAudience.student,
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
    participantType: ParticipantAudience.student,
  },
];
const ageGatedSections = [
  {
    id: 14,
    name: 'Young students',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'Course 4',
    linkToAssigned: 'to Course',
    studentCount: 22,
    linkToStudents: 'to Manage Students tab',
    loginType: 'word',
    code: 'FJDISO',
    providerManaged: false,
    hidden: false,
    participantType: ParticipantAudience.student,
    atRiskAgeGatedDate: new Date('2025-01-01T00:00:00-05:00'),
    atRiskAgeGatedUsState: 'CO',
  },
];
ageGatedSections.push(...sections);

const serverSections = sections.map(serverSectionFromSection);
const ageGatedServerSections = ageGatedSections.map(serverSectionFromSection);

const store = reduxStore({currentUser, teacherSections}, {});
store.dispatch(
  setInitialData({
    id: 1,
    user_type: UserTypes.TEACHER,
  })
);

export const TeacherAtLeastOneSection = () => {
  withFakeServer({sections: serverSections});
  store.dispatch(setSections(serverSections));
  return (
    <Provider store={store}>
      <TeacherSections />
    </Provider>
  );
};
export const TeacherAgeGatedSection = () => {
  withFakeServer({sections: ageGatedServerSections});
  store.dispatch(setSections(ageGatedServerSections));
  return (
    <Provider store={store}>
      <TeacherSections />
    </Provider>
  );
};

export const TeacherNoSections = () => {
  withFakeServer();
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
  server.respondWith(
    'GET',
    '/dashboardapi/sections/available_participant_types',
    successResponse({availableParticipantTypes: ['student', 'teacher']})
  );
}
