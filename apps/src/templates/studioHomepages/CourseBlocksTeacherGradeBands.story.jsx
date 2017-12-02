import React from 'react';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

export default storybook => {
  return storybook
    .storiesOf('CourseBlocksTeacherGradeBands', module)
    .withReduxStore({responsive, isRtl})
    .addStoryTable([
      {
        name: 'course blocks - grade bands',
        description: `This is a set of course blocks listing teacher grade bands`,
        story: () => (
            <CourseBlocksTeacherGradeBands
              isRtl={false}
            />
        )
      },
    ]);
};
