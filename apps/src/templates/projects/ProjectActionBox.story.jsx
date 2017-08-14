import React from 'react';
import ProjectActionBox from './ProjectActionBox';

export default storybook => {
  storybook
    .storiesOf('ProjectActionBox', module)
    .addStoryTable([
        {
          name: 'Already published project',
          description: 'Personal gallery',
          story: () => (
            <ProjectActionBox
              isPublished={true}
            />
          )
        },
        {
          name: 'Not yet published project',
          description: 'Personal gallery',
          story: () => (
            <ProjectActionBox
              isPublished={false}
            />
          )
        },
      ]);
  };
