import React from 'react';
import ProjectsList from './ProjectsList';

const STUB_PROJECTS_DATA = [
  {studentName: 'Alice', name: 'Antelope Freeway', type: 'applab', updatedAt: '2017-01-13'},
  {studentName: 'Bob', name: 'Batyote', type: 'gamelab', updatedAt: '2016-12-31'},
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
