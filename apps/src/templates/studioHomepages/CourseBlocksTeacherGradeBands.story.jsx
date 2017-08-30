import React from 'react';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import Responsive from '../../responsive';

const responsive = new Responsive({
  [Responsive.ResponsiveSize.lg]: 1024,
  [Responsive.ResponsiveSize.md]: 720,
  [Responsive.ResponsiveSize.sm]: 650,
  [Responsive.ResponsiveSize.xs]: 0
});

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
