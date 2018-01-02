import React from 'react';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';

export default storybook => {
  return storybook
    .storiesOf('CourseBlocksStudentGradeBands', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'course blocks - student grade bands',
        description: `This is a set of course blocks listing student grade bands`,
        story: () => (
            <CourseBlocksStudentGradeBands
              showContainer={true}
              hideBottomMargin={false}
            />
        )
      },
    ]);
};
