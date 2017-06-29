import React from 'react';
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
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 14,
    linkToStudents: "to Manage Students tab",
    sectionCode: "ABCDEF"
  },
  {
    name: "Algebra Period 2",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 19,
    linkToStudents: "to Manage Students tab",
    sectionCode: "EEB206"
  },
  {
    name: "Period 3",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 4",
    linkToAssigned: "to Course",
    numberOfStudents: 22,
    linkToStudents: "to Manage Students tab",
    sectionCode: "HPRWHG"
  },
];

const courses = [
  {
    name: "Play Lab",
    description: "Create a story or make a game with Play Lab!",
    link: "https://code.org/playlab",
    image:"photo source",
    assignedSections: []
  },
  {
    name: "CSP Unit 2 - Digital Information",
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
        story: () => (
          <TeacherHomepage
            announcements={announcements}
            sections={[]}
            courses={[]}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
          />
        )
      },
      {
        name: 'Teacher Homepage - courses, no sections',
        description: 'Teacher Homepage - teacher has course progress, but does not have sections',
        story: () => (
          <TeacherHomepage
            announcements={announcements}
            sections={[]}
            courses={courses}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
          />
        )
      },
      {
        name: 'Teacher Homepage - no courses, sections',
        description: 'Teacher Homepage - teacher does not have course progress, but does have sections',
        story: () => (
          <TeacherHomepage
            announcements={announcements}
            sections={sections}
            courses={[]}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
          />
        )
      },
      {
        name: 'Teacher Homepage - courses and sections',
        description: 'Teacher Homepage - teacher does have course progress, and does have sections',
        story: () => (
          <TeacherHomepage
            announcements={announcements}
            sections={sections}
            courses={courses}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
          />
        )
      },
    ]);
};
