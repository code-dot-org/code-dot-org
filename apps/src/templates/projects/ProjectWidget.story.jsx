import React from 'react';
import ProjectWidget from './ProjectWidget';
import {generateFakePersonalProjects} from './generateFakePersonalProjects';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';

export default storybook => {
  const store = getStore();
  return storybook
    .storiesOf('ProjectWidget', module)
    .addStoryTable([
      {
        name: 'Project widget',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
          <Provider store={store}>
            <ProjectWidget
              projectList={generateFakePersonalProjects(5)}
              isRtl={false}
            />
          </Provider>
        )
      }, {
        name: 'Project widget with "view full list" button',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
          <Provider store={store}>
            <ProjectWidget
              projectList={generateFakePersonalProjects(5)}
              isRtl={false}
              canViewFullList={true}
            />
          </Provider>
        )
      }, {
        name: 'Project widget with full list without advanced tools',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
          <Provider store={store}>
            <ProjectWidget
              projectList={generateFakePersonalProjects(5)}
              isRtl={false}
              canViewFullList={true}
              canViewAdvancedTools={false}
            />
          </Provider>
        )
      },
    ]);
};
