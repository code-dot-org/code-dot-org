import React from 'react';
import YourSchoolResources from './YourSchoolResources';

export default storybook => {
  return storybook
    .storiesOf('YourSchoolResources', module)
    .addStoryTable([
      {
        name: 'YourSchoolResources',
        description: `ResourceCards on /yourschool`,
        story: () => (
          <YourSchoolResources/>
        )
      },
    ]);
};
