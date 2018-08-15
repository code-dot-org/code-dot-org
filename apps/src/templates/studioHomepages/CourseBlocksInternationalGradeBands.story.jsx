import React from 'react';
import CourseBlocksInternationalGradeBands from './CourseBlocksInternationalGradeBands';

export default storybook => {
  return storybook
    .storiesOf('Courses/CourseBlocksInternationalGradeBands', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'course blocks - international grade bands',
        description: `This is a set of course blocks listing international grade bands`,
        story: () => (
          <CourseBlocksInternationalGradeBands/>
        )
      },
    ]);
};
