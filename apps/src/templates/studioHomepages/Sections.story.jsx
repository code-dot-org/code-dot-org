import React from 'react';
import Sections from './Sections';

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

export default storybook => {
  return storybook
    .storiesOf('Sections', module)
    .addStoryTable([
      {
        name: 'Sections - teacher at least one section',
        description: 'shows a table of sections on the teacher homepage',
        story: () => (
          <Sections
            sections={sections}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={true}
            canLeave={false}
          />
        )
      },
      {
        name: 'Sections - teacher, no sections yet',
        description: 'shows a set up message if the teacher does not have any sections yet',
        story: () => (
          <Sections
            sections={[]}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={true}
            canLeave={false}
          />
        )
      },
      {
        name: 'Sections - student, no sections yet',
        description: 'shows a join sections component with attention-grabbing dashed border',
        story: () => (
          <Sections
            sections={[]}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={false}
            canLeave={false}
          />
        )
      },
      {
        name: 'Sections - student, enrolled in sections but does NOT have permission to leave the sections',
        description: 'shows a sections table, no column for leave buttons, and a solid border join section component',
        story: () => (
          <Sections
            sections={sections}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={false}
            canLeave={false}
          />
        )
      },
      {
        name: 'Sections - student, enrolled in sections and does have permission to leave the sections',
        description: 'shows a sections table, including a column for leave buttons, and a solid border join section component',
        story: () => (
          <Sections
            sections={sections}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={false}
            canLeave={true}
          />
        )
      },
    ]);
};
