import React from 'react';
import ProjectCard from './ProjectCard';

const defaultData = {
  channel: 'abcdef',
  name: 'Puppy Playdate',
  studentName: 'Penelope',
  studentAge: 8,
  type: 'applab',
  publishedAt: '2016-12-31T23:59:59.999-08:00',
  publishedToPublic: false,
  publishedToClass: false
};

const PUBLISHED_PUBLIC = {
  ...defaultData,
  publishedToPublic: true
};

const PUBLISHED_CLASS = {
  ...defaultData,
  publishedToClass: true
};

const PUBLISHED_BOTH = {
  ...defaultData,
  publishedToPublic: true,
  publishedToClass: true,
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
            projectData={defaultData}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on personal gallery, published on class gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options. Publishing options should include Remove from Class Gallery and Publish to Public Gallery',
        story: () => (
          <ProjectCard
            projectData={PUBLISHED_CLASS}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on personal gallery, published on public gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options. Publishing options should include Publish to Class Gallery and Remove from Public Gallery',
        story: () => (
          <ProjectCard
            projectData={PUBLISHED_PUBLIC}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on personal gallery, published on both public and class gallery',
        description: 'Personal gallery should NOT show student display name and should show chevron, which on-click shows a box with publishing options. Publishing options should include Remove from Class Gallery and Remove from Public Gallery',
        story: () => (
          <ProjectCard
            projectData={PUBLISHED_BOTH}
            currentGallery="personal"
          />
        )
      },
      {
        name: 'Project card on classroom gallery',
        description: 'Classroom gallery should show student display name and should NOT show chevron',
        story: () => (
          <ProjectCard
            projectData={PUBLISHED_BOTH}
            currentGallery="class"
          />
        )
      },
      {
        name: 'Project card on public gallery',
        description: 'Public gallery should NOT show student display name and should NOT show chevron',
        story: () => (
          <ProjectCard
            projectData={PUBLISHED_BOTH}
            currentGallery="public"
          />
        )
      },
    ]);
};
