import React from 'react';
import ManageSectionsCollapsible from './ManageSectionsCollapsible';

export default storybook => {
  return storybook
    .storiesOf('ManageSectionsCollapsible', module)
    .addStoryTable([
      {
        name: 'Manage Sections - at least one section',
        description: 'Manage Sections collapsible section for the teacher homepage that shows a table of sections',
        story: () => (
          <ManageSectionsCollapsible
            sections={[
              {
                name: "Algebra Period 1",
                linkToProgress: "to Progress tab",
                course: "CS in Algebra",
                linkToCourse: "to Course",
                numberOfStudents: 14,
                linkToStudents: "to Manage Students tab",
                sectionCode: "ABCDEF"
              },
              {
                name: "Algebra Period 2",
                linkToProgress: "to Progress tab",
                course: "CS in Algebra",
                linkToCourse: "to Course",
                numberOfStudents: 19,
                linkToStudents: "to Manage Students tab",
                sectionCode: "EEB206"
              },
              {
                name: "Period 3",
                linkToProgress: "to Progress tab",
                course: "Course 4",
                linkToCourse: "to Course",
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
        name: 'Manage Sections - no sections yet',
        description: 'Manage Sections collapsible section for the teacher homepage that shows a set up message if the teacher does not have any sections yet',
        story: () => (
          <ManageSectionsCollapsible
            sections={[]}
            codeOrgUrlPrefix = "http://code.org/"
          />
        )
      },
    ]);
};
