import React from 'react';
import ProjectsList from './ProjectsList';

export default storybook => {
  return storybook
    .storiesOf('ProjectsList', module)
    .addStoryTable([
      {
        name: 'basic projects list',
        description: `This is a simple projects list with stub data.`,
        story: () => (
          <ProjectsList/>
        )
      },
    ]);
};
