import React from 'react';
import ProjectWidget from './ProjectWidget';
import {generateFakePersonalProjects} from './generateFakeProjects';

export default storybook => {
  return storybook
    .storiesOf('Projects/ProjectWidget', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Project widget',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
            <ProjectWidget
              projectList={generateFakePersonalProjects(5)}
            />
        )
      }, {
        name: 'Project widget with "view full list" button',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
            <ProjectWidget
              projectList={generateFakePersonalProjects(5)}
              canViewFullList={true}
            />
        )
      }, {
        name: 'Project widget with full list without advanced tools',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
            <ProjectWidget
              projectList={generateFakePersonalProjects(5)}
              canViewFullList={true}
              canViewAdvancedTools={false}
            />
        )
      },
    ]);
};
