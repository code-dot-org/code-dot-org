import React from 'react';
import CourseBlocksTools from './CourseBlocksTools';
import Responsive from '../../responsive';

const responsive = new Responsive();

export default storybook => {
  return storybook
    .storiesOf('CourseBlocksTools', module)
    .withReduxStore()
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
};
