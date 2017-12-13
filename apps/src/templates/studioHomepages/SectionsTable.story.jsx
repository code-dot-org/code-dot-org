import React from 'react';
import SectionsTable from './SectionsTable';

const sections = [
  {
    name: "Algebra Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 14,
    linkToStudents: "to Manage Students tab",
    login_type: "picture",
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
    login_type: "word",
    code: "EEB206"
  },
  {
    name: "Period 3",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 3",
    linkToAssigned: "to Course",
    numberOfStudents: 22,
    linkToStudents: "to Manage Students tab",
    login_type: "email",
    code: "HPRWHG"
  },
  {
    name: "Period 4",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 4",
    linkToAssigned: "to Course",
    numberOfStudents: 23,
    linkToStudents: "to Manage Students tab",
    login_type: "clever",
    code: "C-GAIDFE"
  },
  {
    name: "Period 5",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 5",
    linkToAssigned: "to Course",
    numberOfStudents: 24,
    linkToStudents: "to Manage Students tab",
    login_type: "google_classroom",
    code: "G-DSLIGFDE"
  }
];

export default storybook => {
  return storybook
    .storiesOf('SectionsTable', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Section Table - three sections for Teacher',
        description: 'This is an example of a basic Section Table when the teacher has three sections',
        story: () => (
          <SectionsTable
            sections={sections}
            isTeacher={true}
            canLeave={false}
            updateSections={storybook.action('updateSections')}
            updateSectionsResult={storybook.action('updateSectionsResult')}
          />
        )
      },
      {
        name: 'Section Table - three sections for students, can NOT leave',
        description: 'This is an example of a basic Section Table when a student has three sections and does not have permission to leave those sections',
        story: () => (
          <SectionsTable
            sections={sections}
            isTeacher={false}
            canLeave={false}
            updateSections={storybook.action('updateSections')}
            updateSectionsResult={storybook.action('updateSectionsResult')}
          />
        )
      },
      {
        name: 'Section Table - three sections for students, can leave',
        description: 'This is an example of a basic Section Table when a student has three sections and does not have permission to leave those sections',
        story: () => (
          <SectionsTable
            sections={sections}
            isTeacher={false}
            canLeave={true}
            updateSections={storybook.action('updateSections')}
            updateSectionsResult={storybook.action('updateSectionsResult')}
          />
        )
      },
    ]);
};
