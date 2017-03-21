import React from 'react';
import ProjectCard from './ProjectCard';

const PROJECTCARD_NOT_PUBLISHED = {
    channel: 'ABCDEFGHIJKLM01234',
    projectName: 'Puppy Playdate',
    studentName: 'Ella',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00',
    publishedToPublic: false,
    publishedToClass: false
  };

  const PROJECTCARD_CLASS_PUBLISHED = {
    channel: 'ABCDEFGHIJKLM01234',
    projectName: 'Puppy Playdate',
    studentName: 'Ella',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00',
    publishedToPublic: false,
    publishedToClass: true
  };

  const PROJECTCARD_PUBLIC_PUBLISHED = {
    channel: 'ABCDEFGHIJKLM01234',
    projectName: 'Puppy Playdate',
    studentName: 'Ella',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00',
    publishedToPublic: true,
    publishedToClass: false
  };

  const PROJECTCARD_BOTH_PUBLISHED = {
    channel: 'ABCDEFGHIJKLM01234',
    projectName: 'Puppy Playdate',
    studentName: 'Ella',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00',
    publishedToPublic: true,
    publishedToClass: true
  };

export default storybook => {
  storybook
    .storiesOf('ProjectCard', module)
    .addStoryTable([
      {
        name: 'Project card on personal gallery, not published on any other gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options. Publishing options should include Publish to Class Gallery and Publish to Public Gallery',
        story: () => (
          <ProjectCard
            projectData={PROJECTCARD_NOT_PUBLISHED}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on personal gallery, published on class gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options. Publishing options should include Remove from Class Gallery and Publish to Public Gallery',
        story: () => (
          <ProjectCard
            projectData={PROJECTCARD_CLASS_PUBLISHED}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on personal gallery, published on public gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options. Publishing options should include Publish to Class Gallery and Remove from Public Gallery',
        story: () => (
          <ProjectCard
            projectData={PROJECTCARD_PUBLIC_PUBLISHED}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on personal gallery, published on both public and class gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options. Publishing options should include Remove from Class Gallery and Remove from Public Gallery',
        story: () => (
          <ProjectCard
            projectData={PROJECTCARD_BOTH_PUBLISHED}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on classroom gallery',
        description: 'Classroom gallery should show student display name and should NOT show chevron',
        story: () => (
          <ProjectCard
            projectData={PROJECTCARD_BOTH_PUBLISHED}
            currentGallery="classroom"
          />
        )
      },
      {
        name: 'Project card on public gallery',
        description: 'Public gallery should NOT show student display name and should NOT show chevron',
        story: () => (
          <ProjectCard
            projectData={PROJECTCARD_BOTH_PUBLISHED}
            currentGallery="public"
          />
        )
      },
    ]);
};
