import React from 'react';
import CourseBlocksTools from './CourseBlocksTools';
import Responsive from '../../responsive';

const responsive = new Responsive({
  [Responsive.ResponsiveSize.lg]: 1024,
  [Responsive.ResponsiveSize.md]: 720,
  [Responsive.ResponsiveSize.sm]: 650,
  [Responsive.ResponsiveSize.xs]: 0
});

export default storybook => storybook
  .storiesOf('CourseBlocksTools', module)
  .addStoryTable([
    {
      name: 'course blocks - tools',
      description: `This is a set of course blocks listing tools`,
      story: () => (
        <CourseBlocksTools
          isEnglish={true}
          isRtl={false}
          responsive={responsive}
        />
      )
    },
  ]);
