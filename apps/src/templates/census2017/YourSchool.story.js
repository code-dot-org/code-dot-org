import React from 'react';
import YourSchool from './YourSchool';

export default storybook => {
  return storybook
    .storiesOf('YourSchool/YourSchool', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'YourSchool',
        description: `Container component for /yourschool`,
        story: () => <YourSchool hideMap={true} />
      },
      {
        name: 'YourSchool - with professional learning banner',
        description: `Container component for /yourschool - with professional learning banner`,
        story: () => (
          <YourSchool hideMap={true} showProfessionalLearningBanner={true} />
        )
      }
    ]);
};
