import React from 'react';
import StudentResources from './StudentResources';

export default storybook => {
  return storybook
    .storiesOf('StudentResources', module)
    .addStoryTable([
      {
        name: 'Resources for students',
        description: `StudentResources that will be used on the student homepage.`,
        story: () => (
          <StudentResources/>
        )
      },
    ]);
};
