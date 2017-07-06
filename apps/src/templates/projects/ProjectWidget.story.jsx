import React from 'react';
import ProjectWidget from './ProjectWidget';
import _ from 'lodash';

function generateFakePersonalProjects() {
  const date = new Date();
  let personalProjects = [];
  personalProjects = _.range(5).map(i => (
    {
      name: "Personal " + i,
      updatedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      type: 'gamelab',
      channel: 'abcd'
    }
  ));
  return personalProjects;
}

export default storybook => {
  storybook
    .storiesOf('ProjectWidget', module)
    .addStoryTable([
      {
        name: 'Project widget',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
          <ProjectWidget
            projectList={generateFakePersonalProjects()}
          />
        )
      },
    ]);
};
