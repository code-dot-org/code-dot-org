import React from 'react';
import StudentResources from './StudentResources';

export default storybook => {
  return storybook
    .storiesOf('StudentResources', module)
    .addStoryTable([
      {
        name: 'Resources for students',
        description: `This is the StudentResources section that will be used on the student homepage.`,
        story: () => (
          <StudentResources/>
        )
      },
    ]);
};
