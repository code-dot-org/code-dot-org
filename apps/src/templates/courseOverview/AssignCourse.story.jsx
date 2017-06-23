import React from 'react';
import AssignCourse from './AssignCourse';

console.log('test');

const defaultProps = {
  courseId: 30,
  sectionsInfo: [
    {
      id: 11,
      name: "brent_section"
    },
    {
      id: 12,
      name: "section2"
    },
    {
      id: 307,
      name: "plc"
    },
    {
      id: 338,
      name: "section_with_course"
    }
  ]
};

export default storybook => {
  storybook
    .storiesOf('AssignCourse', module)
    .addStoryTable([
      {
        name: 'AssignCourse dropdown',
        story: () => (
          <AssignCourse
            {...defaultProps}
          />
        )
      },
    ]);
};
