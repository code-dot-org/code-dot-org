import React from 'react';
import YourSchoolResources from './YourSchoolResources';

export default storybook => {
  return storybook
    .storiesOf('YourSchool/YourSchoolResources', module)
    .withReduxStore()
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
