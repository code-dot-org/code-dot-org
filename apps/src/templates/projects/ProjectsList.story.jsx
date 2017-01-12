import React from 'react';
import ProjectsList from './ProjectsList';

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2017-01-13'
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Batyote',
    studentName: 'Bob',
    type: 'gamelab',
    updatedAt: '2016-12-31'
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
