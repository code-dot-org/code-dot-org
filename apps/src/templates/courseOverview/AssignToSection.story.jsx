import React from 'react';
import AssignToSection from './AssignToSection';

const defaultProps = {
  courseId: 30,
  assignmentName: 'Computer Science Principles',
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
    .storiesOf('AssignToSection', module)
    .addStoryTable([
      {
        name: 'AssignToSection dropdown',
        story: () => (
          <AssignToSection
            {...defaultProps}
          />
        )
      },
    ]);
};
