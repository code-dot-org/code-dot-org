import React from 'react';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import Responsive from '../../responsive';

const responsive = new Responsive();

export default storybook => storybook
  .storiesOf('CourseBlocksTeacherGradeBands', module)
  .addStoryTable([
    {
      name: 'course blocks - grade bands',
      description: `This is a set of course blocks listing teacher grade bands`,
      story: () => (
        <CourseBlocksTeacherGradeBands
          isRtl={false}
          responsive={responsive}
        />
      )
    },
  ]);
