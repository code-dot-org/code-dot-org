import React from 'react';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import Responsive from '../../responsive';

const responsive = new Responsive({
  [Responsive.ResponsiveSize.lg]: 1024,
  [Responsive.ResponsiveSize.md]: 720,
  [Responsive.ResponsiveSize.sm]: 650,
  [Responsive.ResponsiveSize.xs]: 0
});

export default storybook => storybook
  .storiesOf('CourseBlocksStudentGradeBands', module)
  .addStoryTable([
    {
      name: 'course blocks - student grade bands',
      description: `This is a set of course blocks listing student grade bands`,
      story: () => (
        <CourseBlocksStudentGradeBands
          isRtl={false}
          responsive={responsive}
        />
      )
    },
  ]);
