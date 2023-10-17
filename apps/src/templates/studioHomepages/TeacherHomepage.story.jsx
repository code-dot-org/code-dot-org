import React from 'react';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';
import sinon from 'sinon';
import teacherSections, {
  serverSectionFromSection,
} from '../teacherDashboard/teacherSectionsRedux';
import TeacherHomepage from './TeacherHomepage';
import {
  announcement,
  courses,
  plCourses,
  topPlCourse,
  topCourse,
  joinedStorySections,
  joinedPlSections,
} from '../../../test/unit/templates/studioHomepages/homepagesTestData';

const serverSections = joinedStorySections.map(serverSectionFromSection);
const joinedPlServerSections = joinedPlSections.map(serverSectionFromSection);

const serverCourses = [
  {
    title: 'Play Lab',
    link: 's/playlab',
    description: 'HOC for playlab',
    name: 'playlab',
  },
  {
    title: 'CSP Unit 2 - Digital Information',
    link: 's/csp2-2020',
    description: 'Learning about digital info',
    name: 'csp2-2020',
  },
];

export default {
  title: 'TeacherHomepage',
  component: TeacherHomepage,
};

const Template = args => {
  withFakeServer(args.fakeServerArgs);
  return (
    <Provider store={reduxStore({teacherSections})}>
      <TeacherHomepage
        announcements={[announcement]}
        isEnglish={true}
        showCensusBanner={false}
        {...args.props}
      />
    </Provider>
  );
};

export const NoCoursesNoSections = Template.bind({});
NoCoursesNoSections.args = {
  fakeServerArgs: {},
  props: {
    courses: [],
    plCourses: [],
    joinedStudentSections: [],
    joinedPlSections: [],
  },
};

export const CoursesNoSections = Template.bind({});
CoursesNoSections.args = {
  fakeServerArgs: {courses: serverCourses},
  props: {
    topCourse: topCourse,
    courses: courses,
    joinedStudentSections: [],
    joinedPlSections: [],
  },
};

export const NoCoursesSections = Template.bind({});
NoCoursesSections.args = {
  fakeServerArgs: {sections: serverSections},
  props: {
    courses: [],
    joinedStudentSections: joinedStorySections,
    joinedPlSections: [],
  },
};

export const CoursesSections = Template.bind({});
CoursesSections.args = {
  fakeServerArgs: {
    courses: serverCourses,
    sections: serverSections,
  },
  props: {
    courses: courses,
    topCourse: topCourse,
    joinedStudentSections: joinedStorySections,
    joinedPlSections: [],
  },
};

export const StudentAndPLCoursesSectionsStudentSections = Template.bind({});
StudentAndPLCoursesSectionsStudentSections.args = {
  fakeServerArgs: {
    courses: serverCourses,
    sections: serverSections,
  },
  props: {
    courses: courses,
    topCourse: topCourse,
    plCourses: plCourses,
    topPlCourse: topPlCourse,
    joinedStudentSections: joinedStorySections,
    joinedPlSections: [],
  },
};

export const CoursesSectionsAndJoinedPLSections = Template.bind({});
CoursesSectionsAndJoinedPLSections.args = {
  fakeServerArgs: {
    courses: serverCourses,
    sections: [].concat(serverSections, joinedPlServerSections),
  },
  props: {
    courses: courses,
    topCourse: topCourse,
    plCourses: plCourses,
    topPlCourse: topPlCourse,
    joinedStudentSections: joinedStorySections,
    joinedPlSections: joinedPlSections,
  },
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
  server.respondWith(
    'GET',
    '/dashboardapi/sections/available_participant_types',
    successResponse({availableParticipantTypes: ['student', 'teacher']})
  );
}
