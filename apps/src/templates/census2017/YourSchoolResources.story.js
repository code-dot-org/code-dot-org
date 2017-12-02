import React from 'react';
import YourSchoolResources from './YourSchoolResources';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

export default storybook => {
  return storybook
    .storiesOf('YourSchoolResources', module)
    .withReduxStore({responsive, isRtl})
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
