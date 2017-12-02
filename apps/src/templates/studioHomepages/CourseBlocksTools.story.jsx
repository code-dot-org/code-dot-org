import React from 'react';
import CourseBlocksTools from './CourseBlocksTools';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

export default storybook => {
  return storybook
    .storiesOf('CourseBlocksTools', module)
    .withReduxStore({responsive, isRtl})
    .addStoryTable([
      {
        name: 'course blocks - tools',
        description: `This is a set of course blocks listing tools`,
        story: () => (
          <CourseBlocksTools
            isEnglish={true}
            isRtl={true}
          />
        )
      },
    ]);
};
