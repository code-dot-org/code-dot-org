import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import teacherSections, {setSections, serverSectionFromSection} from '../teacherDashboard/teacherSectionsRedux';
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
    name: "Algebra Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 14,
    linkToStudents: "to Manage Students tab",
    code: "ABCDEF"
  },
  {
    name: "Algebra Period 2",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 19,
    linkToStudents: "to Manage Students tab",
    code: "EEB206"
  },
  {
    name: "Period 3",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 4",
    linkToAssigned: "to Course",
    numberOfStudents: 22,
    linkToStudents: "to Manage Students tab",
    code: "HPRWHG"
  },
];
const serverSections = sections.map(serverSectionFromSection);

const courses = [
  {
    title: "Play Lab",
    description: "Create a story or make a game with Play Lab!",
    link: "https://code.org/playlab",
    image:"photo source",
    assignedSections: []
  },
  {
    title: "CSP Unit 2 - Digital Information",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit2/",
    image:"photo source",
    assignedSections: []
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
                sections={[]}
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
          withFakeServer({courses});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={announcements}
                sections={[]}
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
          store.dispatch(setSections(serverSections));
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={announcements}
                sections={sections}
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
          withFakeServer({courses, sections: serverSections});
          registerReducers({teacherSections});
          const store = createStoreWithReducers();
          return (
            <Provider store={store}>
              <TeacherHomepage
                announcements={announcements}
                sections={sections}
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
