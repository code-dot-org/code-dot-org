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
    .addStoryTable([
      {
        name: 'Project card on student personal gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options',
        story: () => (
          <ProjectCard
            projectData={EXAMPLE_PROJECTCARD_DATA}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on classroom gallery',
        description: 'Classroom gallery should show student display name and should NOT show chevron',
        story: () => (
          <ProjectCard
            projectData={EXAMPLE_PROJECTCARD_DATA}
            currentGallery="classroom"
          />
        )
      },
      {
        name: 'Project card on public gallery',
        description: 'Public gallery should NOT show student display name and should NOT show chevron',
        story: () => (
          <ProjectCard
            projectData={EXAMPLE_PROJECTCARD_DATA}
            currentGallery="public"
          />
        )
      },

    ]);
};
