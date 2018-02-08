import React from 'react';
import YourSchool from './YourSchool';

export default storybook => {
  return storybook
    .storiesOf('YourSchool', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'YourSchool',
        description: `Container component for /yourschool`,
        story: () => (
          <YourSchool/>
        )
      },
    ]);
};
