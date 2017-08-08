import React from 'react';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';

export default storybook => storybook
  .storiesOf('CourseBlocksGradeBands', module)
  .addStoryTable([
    {
      name: 'course blocks - grade bands',
      description: `This is a set of course blocks listing grade bands`,
      story: () => (
        <CourseBlocksGradeBands
          isEnglish={true}
          isRtl={false}
        />
      )
    },
  ]);
