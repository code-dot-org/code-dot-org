import React from 'react';
import SectionsTable from './SectionsTable';

export default storybook => {
  return storybook
    .storiesOf('SectionsTable', module)
    .addStoryTable([
      {
        name: 'Section Table - three sections for Teacher',
        description: 'This is an example of a basic Section Table when the teacher has three sections',
        story: () => (
          <SectionsTable
            sections={[
              {
                name: "Algebra Period 1",
                teacherName: "Ms. Frizzle",
                linkToProgress: "to Progress tab",
                assignedTitle: "CS in Algebra",
                linkToAssigned: "to Course",
                numberOfStudents: 14,
                linkToStudents: "to Manage Students tab",
                sectionCode: "ABCDEF"
              },
              {
                name: "Algebra Period 2",
                teacherName: "Ms. Frizzle",
                linkToProgress: "to Progress tab",
                assignedTitle: "CS in Algebra",
                linkToAssigned: "to Course",
                numberOfStudents: 19,
                linkToStudents: "to Manage Students tab",
                sectionCode: "EEB206"
              },
              {
                name: "Period 3",
                teacherName: "Ms. Frizzle",
                linkToProgress: "to Progress tab",
                assignedTitle: "Course 4",
                linkToAssigned: "to Course",
                numberOfStudents: 22,
                linkToStudents: "to Manage Students tab",
                sectionCode: "HPRWHG"
              },
            ]}
            isRtl={false}
            isTeacher={true}
          />
        )
      },
      {
        name: 'Section Table - three sections for Students',
        description: 'This is an example of a basic Section Table when a student has three sections',
        story: () => (
          <SectionsTable
            sections={[
              {
                name: "Algebra Period 1",
                teacherName: "Ms. Frizzle",
                linkToProgress: "to Progress tab",
                assignedTitle: "CS in Algebra",
                linkToAssigned: "to Course",
                numberOfStudents: 14,
                linkToStudents: "to Manage Students tab",
                sectionCode: "ABCDEF"
              },
              {
                name: "Algebra Period 2",
                teacherName: "Ms. Frizzle",
                linkToProgress: "to Progress tab",
                assignedTitle: "CS in Algebra",
                linkToAssigned: "to Course",
                numberOfStudents: 19,
                linkToStudents: "to Manage Students tab",
                sectionCode: "EEB206"
              },
              {
                name: "Period 3",
                teacherName: "Ms. Frizzle",
                linkToProgress: "to Progress tab",
                assignedTitle: "Course 4",
                linkToAssigned: "to Course",
                numberOfStudents: 22,
                linkToStudents: "to Manage Students tab",
                sectionCode: "HPRWHG"
              },
            ]}
            isRtl={false}
            isTeacher={false}
          />
        )
      },
    ]);
};
