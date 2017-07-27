import React from 'react';
import ProjectWidget from './ProjectWidget';
import {generateFakePersonalProjects} from './generateFakePersonalProjects';

export default storybook => {
  storybook
    .storiesOf('ProjectWidget', module)
    .addStoryTable([
      {
        name: 'Project widget',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
          <ProjectWidget
            projectList={generateFakePersonalProjects(5)}
          />
        )
      },
    ]);
};
