import React from 'react';
import ProjectsList from './ProjectsList';

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00'
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Batyote',
    studentName: 'Bob',
    type: 'gamelab',
    updatedAt: '2017-01-01T00:00:00.001-08:00'
  },
];

export default storybook => {
  return storybook
    .storiesOf('ProjectsList', module)
    .addStoryTable([
      {
        name: 'basic projects list',
        description: `This is a simple projects list with stub data.`,
        story: () => (
          <ProjectsList projectsData={STUB_PROJECTS_DATA}/>
        )
      },
    ]);
};
