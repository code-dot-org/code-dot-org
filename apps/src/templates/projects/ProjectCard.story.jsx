import React from 'react';
import ProjectCard from './ProjectCard';

const EXAMPLE_PROJECTCARD_DATA = {
    channel: 'ABCDEFGHIJKLM01234',
    projectName: 'Puppy Playdate',
    studentName: 'Ella',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00',
    publishedToPublic: false,
    publishedToClass: true
  };

export default storybook => {
  storybook
    .storiesOf('ProjectCard', module)
    .addWithInfo(
      'default props',
      'This is how ProjectCard will look with the default props',
      () => <ProjectCard projectData={EXAMPLE_PROJECTCARD_DATA}/>
    );
};
