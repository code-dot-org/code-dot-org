import React from 'react';
import YourSchool from './YourSchool';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

export default storybook => {
  return storybook
    .storiesOf('YourSchool', module)
    .withReduxStore({responsive, isRtl})
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
