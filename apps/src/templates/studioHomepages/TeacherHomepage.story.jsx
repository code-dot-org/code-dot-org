import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import teacherSections, {
  serverSectionFromSection
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
  joinedSections
} from '../../../test/unit/templates/studioHomepages/homepagesTestData';

const serverSections = taughtSections.map(serverSectionFromSection);

const serverCourses = [
  {
    id: 49,
    name: 'Play Lab',
    category: 'Hour of Code',
    category_priority: 2,
    script_name: 'playlab'
  },
  {
    id: 50,
    name: 'CSP Unit 2 - Digital Information',
    category: 'CSP',
    category_priority: 1,
    script_name: 'csp2'
  }
];

export default storybook => {
  return storybook
    .storiesOf('Homepages/Teachers/TeacherHomepage', module)
    .addStoryTable([
      {
        name: 'Teacher Homepage - no courses, no sections',
        description:
          'Teacher Homepage - teacher does not have course progress, nor do they have sections',
        story: () => {
          withFakeServer();
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={[announcement]}
                courses={[]}
                plCourses={[]}
                joinedStudentSections={[]}
                joinedPlSections={[]}
                isEnglish={true}
                showCensusBanner={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - courses, no sections',
        description:
          'Teacher Homepage - teacher has course progress, but does not have sections',
        story: () => {
          withFakeServer({courses: serverCourses});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={[announcement]}
                topCourse={topCourse}
                courses={courses}
                joinedStudentSections={[]}
                joinedPlSections={[]}
                isEnglish={true}
                showCensusBanner={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - no courses, sections',
        description:
          'Teacher Homepage - teacher does not have course progress, but does have sections',
        story: () => {
          withFakeServer({sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={[announcement]}
                courses={[]}
                joinedStudentSections={[]}
                joinedPlSections={[]}
                isEnglish={true}
                showCensusBanner={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - courses and sections',
        description:
          'Teacher Homepage - teacher does have course progress, and does have sections',
        story: () => {
          withFakeServer({courses: serverCourses, sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={[announcement]}
                courses={courses}
                topCourse={topCourse}
                joinedStudentSections={[]}
                joinedPlSections={[]}
                isEnglish={true}
                showCensusBanner={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - courses, sections and joinedStudentSections',
        description:
          'Teacher Homepage - teacher does have course progress, and does have sections they own and sections in which they are a student',
        story: () => {
          withFakeServer({courses: serverCourses, sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={[announcement]}
                courses={courses}
                topCourse={topCourse}
                joinedStudentSections={joinedSections}
                joinedPlSections={[]}
                isEnglish={true}
                showCensusBanner={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - courses, sections and joinedStudentSections',
        description:
          'Teacher Homepage - teacher does have course progress in both student and pl courses, and does have sections they own and sections in which they are a student',
        story: () => {
          withFakeServer({courses: serverCourses, sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={[announcement]}
                courses={courses}
                topCourse={topCourse}
                plCourses={plCourses}
                topPlCourse={topPlCourse}
                joinedStudentSections={joinedSections}
                joinedPlSections={[]}
                isEnglish={true}
                showCensusBanner={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - courses, sections and joinedPlSections',
        description:
          'Teacher Homepage - teacher does have course progress in both student and pl courses, and does have sections they own and sections in which they are a student',
        story: () => {
          withFakeServer({courses: serverCourses, sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={[announcement]}
                courses={courses}
                topCourse={topCourse}
                plCourses={plCourses}
                topPlCourse={topPlCourse}
                joinedStudentSections={[]}
                joinedPlSections={joinedPlSections}
                isEnglish={true}
                showCensusBanner={false}
              />
            </Provider>
          );
        }
      }
    ]);
};

function withFakeServer({courses = [], sections = []} = {}) {
  const server = sinon.fakeServer.create({
    autoRespond: true
  });
  const successResponse = body => [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify(body)
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
