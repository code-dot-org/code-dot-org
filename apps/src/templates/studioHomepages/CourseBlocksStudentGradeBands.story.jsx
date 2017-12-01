import React from 'react';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import responsive, {setResponsiveSize} from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

export default storybook => {
  return storybook
    .storiesOf('CourseBlocksStudentGradeBands', module)
    .withReduxStore({responsive, isRtl}, [setResponsiveSize('lg')])
    .addStoryTable([
      {
        name: 'course blocks - student grade bands',
        description: `This is a set of course blocks listing student grade bands`,
        story: () => (
            <CourseBlocksStudentGradeBands
              isRtl={false}
              showContainer={true}
              hideBottomMargin={false}
            />
        )
      },
    ]);
};
