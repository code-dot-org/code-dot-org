import React from 'react';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';

export default storybook => {
  return storybook
    .storiesOf('Courses/CourseBlocksTeacherGradeBands', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'course blocks - grade bands',
        description: `This is a set of course blocks listing teacher grade bands`,
        story: () => (
          <CourseBlocksTeacherGradeBands/>
        )
      },
    ]);
};
