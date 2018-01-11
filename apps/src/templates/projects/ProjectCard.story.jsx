import React from 'react';
import ProjectCard from './ProjectCard';

// publishedAt data is normally a timestamp, but for Storybook
// display purposes, use a descriptive string
const defaultData = {
  channel: 'abcdef',
  name: 'Puppy Playdate',
  studentName: 'Penelope',
  studentAgeRange: '8+',
  type: 'applab',
  publishedAt: 'a day ago',
  updatedAt: 'about a week ago'
};

export default storybook => {
  storybook
    .storiesOf('ProjectCard', module)
    .addStoryTable([
      {
        name: 'Project card - public',
        description: 'Project Gallery card used in the public gallery',
        story: () => (
          <ProjectCard
            projectData={defaultData}
            currentGallery="public"
          />
        )
      },
      {
        name: 'Project card - personal',
        description: 'Project Gallery card used in the personl project widget',
        story: () => (
          <ProjectCard
            projectData={defaultData}
            currentGallery="personal"
          />
        )
      },
    ]);
};
