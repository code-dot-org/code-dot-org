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
  taughtSections,
  joinedPlSections,
  joinedSections,
} from '../../../test/unit/templates/studioHomepages/homepagesTestData';

const serverSections = taughtSections.map(serverSectionFromSection);

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

const Template = (fakeServerArgs, args) => {
  withFakeServer(fakeServerArgs);
  return (
    <Provider store={reduxStore({teacherSections})}>
      <TeacherHomepage
        announcements={[announcement]}
        isEnglish={true}
        showCensusBanner={false}
        {...args}
      />
    </Provider>
  );
};

export const NoCoursesNoSections = Template.bind({});
NoCoursesNoSections.args = {
  courses: [],
  plCourses: [],
  joinedStudentSections: [],
  joinedPlSections: [],
};

export const CoursesNoSections = Template.bind({});
CoursesNoSections.fakeServerArgs = {courses: serverCourses};
CoursesNoSections.args = {
  topCourse: topCourse,
  courses: courses,
  joinedStudentSections: [],
  joinedPlSections: [],
};

export const NoCoursesSections = Template.bind({});
NoCoursesSections.fakeServerArgs = {sections: serverSections};
NoCoursesSections.args = {
  courses: [],
  joinedStudentSections: [],
  joinedPlSections: [],
};

export const CoursesSections = Template.bind({});
CoursesSections.fakeServerArgs = {
  courses: serverCourses,
  sections: serverSections,
};
CoursesSections.args = {
  courses: courses,
  topCourse: topCourse,
  joinedStudentSections: [],
  joinedPlSections: [],
};

export const CoursesSectionsStudentSections = Template.bind({});
CoursesSectionsStudentSections.fakeServerArgs = {
  courses: serverCourses,
  sections: serverSections,
};
CoursesSectionsStudentSections.args = {
  courses: courses,
  topCourse: topCourse,
  joinedStudentSections: joinedSections,
  joinedPlSections: [],
};

export const StudentAndPLCoursesSectionsStudentSections = Template.bind({});
StudentAndPLCoursesSectionsStudentSections.fakeServerArgs = {
  courses: serverCourses,
  sections: serverSections,
};
StudentAndPLCoursesSectionsStudentSections.args = {
  courses: courses,
  topCourse: topCourse,
  plCourses: plCourses,
  topPlCourse: topPlCourse,
  joinedStudentSections: joinedSections,
  joinedPlSections: [],
};

export const CoursesSectionsAndJoinedPLSections = Template.bind({});
CoursesSectionsAndJoinedPLSections.fakeServerArgs = {
  courses: serverCourses,
  sections: serverSections,
};
CoursesSectionsAndJoinedPLSections.args = {
  courses: courses,
  topCourse: topCourse,
  plCourses: plCourses,
  topPlCourse: topPlCourse,
  joinedStudentSections: [],
  joinedPlSections: joinedPlSections,
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
}
