import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import teacherSections, {serverSectionFromSection} from '../teacherDashboard/teacherSectionsRedux';
import TeacherHomepage from './TeacherHomepage';

const announcements = [
  {
    heading: "Go beyond an Hour of Code",
    buttonText: "Go Beyond",
    description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
    link: "to wherever"
  }
];

const sections = [
  {
    id: 11,
    name: "Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "https://code.org/teacher-dashboard#/sections/111111/progress",
    assignedTitle: "Course 1",
    linkToAssigned: "https://studio.code.org/s/course1",
    numberOfStudents: 1,
    studentCount: 1,
    linkToStudents: "https://code.org/teacher-dashboard#/sections/111111/manage",
    code: "ABCDEF",
    loginType: 'picture',
    stageExtras: false,
    pairingAllowed: true,
    courseId: null,
    scriptId: null,
    hidden: false
  },
  {
    id: 12,
    name: "Period 2",
    teacherName: "Ms. Frizzle",
    linkToProgress: "https://code.org/teacher-dashboard#/sections/222222/progress",
    assignedTitle: "Course 2",
    linkToAssigned: "https://studio.code.org/s/course2",
    numberOfStudents: 2,
    studentCount: 2,
    linkToStudents: "https://code.org/teacher-dashboard#/sections/222222/manage",
    code: "EEBSKR",
    loginType: 'picture',
    stageExtras: false,
    pairingAllowed: true,
    courseId: null,
    scriptId: null,
    hidden: false
  },
];
const serverSections = sections.map(serverSectionFromSection);

const courses = [
  {
    title: "Play Lab",
    description: "Create a story or make a game with Play Lab!",
    link: "https://code.org/playlab",
    image:"photo source",
    assignedSections: [],
  },
  {
    title: "CSP Unit 2 - Digital Information",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit2/",
    image:"photo source",
    assignedSections: [],
  },
];

const serverCourses = [
  {
    id: 49,
    name: 'Play Lab',
    category: 'Hour of Code',
    category_priority: 2,
    script_name: 'playlab',
  },
  {
    id: 50,
    name: "CSP Unit 2 - Digital Information",
    category: 'CSP',
    category_priority: 1,
    script_name: 'csp2',
  },
];


export default storybook => {
  return storybook
    .storiesOf('TeacherHomepage', module)
    .addStoryTable([
      {
        name: 'Teacher Homepage - no courses, no sections',
        description: 'Teacher Homepage - teacher does not have course progress, nor do they have sections',
        story: () => {
          withFakeServer();
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={announcements}
                courses={[]}
                isRtl={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - courses, no sections',
        description: 'Teacher Homepage - teacher has course progress, but does not have sections',
        story: () => {
          withFakeServer({courses: serverCourses});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={announcements}
                courses={courses}
                isRtl={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - no courses, sections',
        description: 'Teacher Homepage - teacher does not have course progress, but does have sections',
        story: () => {
          withFakeServer({sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={announcements}
                courses={[]}
                isRtl={false}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Teacher Homepage - courses and sections',
        description: 'Teacher Homepage - teacher does have course progress, and does have sections',
        story: () => {
          withFakeServer({courses: serverCourses, sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={announcements}
                courses={courses}
                isRtl={false}
              />
            </Provider>
          );
        }
      },
    ]);
};

function withFakeServer({courses = [], sections = []} = {}) {
  const server = sinon.fakeServer.create({
    autoRespond: true,
  });
  const successResponse = (body) => [
    200,
    {"Content-Type": "application/json"},
    JSON.stringify(body)
  ];
  server.respondWith('GET', '/dashboardapi/courses', successResponse(courses));
  server.respondWith('GET', '/dashboardapi/sections', successResponse(sections));
  server.respondWith('GET', '/v2/sections/valid_scripts', successResponse([]));
}
