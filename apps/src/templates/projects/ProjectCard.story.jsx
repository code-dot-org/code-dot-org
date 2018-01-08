import React from 'react';
import ProjectCard from './ProjectCard';

const defaultData = {
  channel: 'abcdef',
  name: 'Puppy Playdate',
  studentName: 'Penelope',
  studentAgeRange: '8+',
  type: 'applab',
  publishedAt: '2016-12-31T23:59:59.999-08:00',
};

export default storybook => {
  storybook
    .storiesOf('ProjectCard', module)
    .addStoryTable([
      {
        name: 'Project card',
        description: 'Project Gallery card used in the public gallery and personal projects widget on /home',
        story: () => (
          <ProjectCard
            projectData={defaultData}
          />
        )
      },
    ]);
};
