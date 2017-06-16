import React from 'react';
import Sections from './Sections';

export default storybook => {
  return storybook
    .storiesOf('Sections', module)
    .addStoryTable([
      {
        name: 'Sections - at least one section',
        description: 'shows a table of sections on the teacher homepage',
        story: () => (
          <Sections
            sections={[
              {
                name: "Algebra Period 1",
                linkToProgress: "to Progress tab",
                course: "CS in Algebra",
                linkToAssigned: "to Course",
                numberOfStudents: 14,
                linkToStudents: "to Manage Students tab",
                sectionCode: "ABCDEF"
              },
              {
                name: "Algebra Period 2",
                linkToProgress: "to Progress tab",
                course: "CS in Algebra",
                linkToAssigned: "to Course",
                numberOfStudents: 19,
                linkToStudents: "to Manage Students tab",
                sectionCode: "EEB206"
              },
              {
                name: "Period 3",
                linkToProgress: "to Progress tab",
                course: "Course 4",
                linkToAssigned: "to Course",
                numberOfStudents: 22,
                linkToStudents: "to Manage Students tab",
                sectionCode: "HPRWHG"
              },
            ]}
            codeOrgUrlPrefix = "http://code.org/"
          />
        )
      },
      {
        name: 'Sections - no sections yet',
        description: 'shows a set up message if the teacher does not have any sections yet',
        story: () => (
          <Sections
            sections={[]}
            codeOrgUrlPrefix = "http://code.org/"
          />
        )
      },
    ]);
};
