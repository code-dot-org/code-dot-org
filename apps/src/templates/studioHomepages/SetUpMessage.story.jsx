import React from 'react';
import SetUpMessage from './SetUpMessage';

export default storybook => {
  return storybook
    .storiesOf('SetUpMessage', module)
    .addStoryTable([
      {
        name: 'Set Up Message for Courses',
        description: `Information box if the teacher doesn't have any courses yet`,
        story: () => (
          <SetUpMessage
            type="courses"
            codeOrgUrlPrefix="http://code.org/"
          />
        )
      },
      {
        name: 'Set Up Message for Sections',
        description: `Information box if the teacher doesn't have any sections yet`,
        story: () => (
          <SetUpMessage
            type="sections"
            codeOrgUrlPrefix="http://code.org/"
          />
        )
      },
    ]);
};
