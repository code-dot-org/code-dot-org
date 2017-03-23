import React from 'react';
import ProjectCardGrid from './ProjectCardGrid';

// function generateFakeProject(overrideData) {
//   return {
//     ...defaultProject,
//     ...overrideData
//   };
// }
//
// // elsewhere
// generateFakeProject({publishedToClass: true});

const CLASS_PROJECTS = [
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Puppy Playdate',
      studentName: 'Penelope',
      studentAge: 8,
      type: 'applab',
      updatedAt: '2016-10-31T23:59:59.999-08:00',
      publishedToPublic: false,
      publishedToClass: true
    },
    currentGallery: "class"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Mouse Maze',
      studentName: 'Maisy',
      studentAge: 13,
      type: 'weblab',
      updatedAt: '2016-11-30T23:59:59.999-08:00',
      publishedToPublic: false,
      publishedToClass: true
    },
    currentGallery: "class"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Furry Frenzy',
      studentName: 'Felix',
      studentAge: 6,
      type: 'gamelab',
      updatedAt: '2016-10-30T23:59:59.999-08:00',
      publishedToPublic: false,
      publishedToClass: true
    },
    currentGallery: "class"
  },
];

const PUBLIC_PROJECTS = [
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Applab 1',
      studentName: 'Penelope',
      studentAge: 4,
      type: 'applab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Applab 2',
      studentName: 'Penelope',
      studentAge: 8,
      type: 'applab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Applab 3',
      studentName: 'Penelope',
      studentAge: 13,
      type: 'applab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Applab 4',
      studentName: 'Penelope',
      studentAge: 18,
      type: 'applab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Applab 5',
      studentName: 'Penelope',
      studentAge: 14,
      type: 'applab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Gamelab 1',
      studentName: 'Penelope',
      studentAge: 4,
      type: 'gamelab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Gamelab 2',
      studentName: 'Penelope',
      studentAge: 8,
      type: 'gamelab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Gamelab 3',
      studentName: 'Penelope',
      studentAge: 13,
      type: 'gamelab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Gamelab 4',
      studentName: 'Penelope',
      studentAge: 18,
      type: 'gamelab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Gamelab 5',
      studentName: 'Penelope',
      studentAge: 14,
      type: 'gamelab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Weblab 1',
      studentName: 'Penelope',
      studentAge: 4,
      type: 'weblab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Weblab 2',
      studentName: 'Penelope',
      studentAge: 8,
      type: 'weblab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Weblab 3',
      studentName: 'Penelope',
      studentAge: 13,
      type: 'weblab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Weblab 4',
      studentName: 'Penelope',
      studentAge: 18,
      type: 'weblab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Weblab 5',
      studentName: 'Penelope',
      studentAge: 14,
      type: 'weblab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Artist 1',
      studentName: 'Penelope',
      studentAge: 4,
      type: 'artist',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Artist 2',
      studentName: 'Penelope',
      studentAge: 8,
      type: 'artist',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Artist 3',
      studentName: 'Penelope',
      studentAge: 13,
      type: 'artist',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Artist 4',
      studentName: 'Penelope',
      studentAge: 18,
      type: 'artist',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Artist 5',
      studentName: 'Penelope',
      studentAge: 14,
      type: 'artist',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Playlab 1',
      studentName: 'Penelope',
      studentAge: 4,
      type: 'playlab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Playlab 2',
      studentName: 'Penelope',
      studentAge: 8,
      type: 'playlab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Playlab 3',
      studentName: 'Penelope',
      studentAge: 13,
      type: 'playlab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Playlab 4',
      studentName: 'Penelope',
      studentAge: 18,
      type: 'playlab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Playlab 5',
      studentName: 'Penelope',
      studentAge: 14,
      type: 'playlab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "public"
  },
];

const PERSONAL_PROJECTS = [
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Personal 1',
      studentName: 'Penelope',
      type: 'applab',
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      publishedToPublic: false,
      publishedToClass: false
    },
    currentGallery: "personal"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Personal 2',
      studentName: 'Penelope',
      type: 'applab',
      updatedAt: '2016-11-30T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: false
    },
    currentGallery: "personal"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Personal 3',
      studentName: 'Penelope',
      type: 'applab',
      updatedAt: '2016-10-31T23:59:59.999-08:00',
      publishedToPublic: false,
      publishedToClass: true
    },
    currentGallery: "personal"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Personal 4',
      studentName: 'Penelope',
      type: 'applab',
      updatedAt: '2016-10-30T23:59:59.999-08:00',
      publishedToPublic: true,
      publishedToClass: true
    },
    currentGallery: "personal"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Personal 5',
      studentName: 'Penelope',
      type: 'applab',
      updatedAt: '2016-10-29T23:59:59.999-08:00',
      publishedToPublic: false,
      publishedToClass: false
    },
    currentGallery: "personal"
  },
  {
    projectData: {
      channel: 'ABCDEFGHIJKLM01234',
      projectName: 'Personal 6',
      studentName: 'Penelope',
      type: 'applab',
      updatedAt: '2016-10-28T23:59:59.999-08:00',
      publishedToPublic: false,
      publishedToClass: false
    },
    currentGallery: "personal"
  },
];

export default storybook => {
  storybook
    .storiesOf('ProjectCardGrid', module)
    .addStoryTable([
      {
        name: 'Class Gallery',
        description: 'Class gallery sorted by recency of when the project was added.',
        story: () => (
          <ProjectCardGrid
            projects = {CLASS_PROJECTS}
            galleryType = "classroom"
          />
        )
      },
      {
        name: 'Public Gallery',
        description: 'Public gallery sorted by project type AND recency of when the project was added.',
        story: () => (
          <ProjectCardGrid
            projects = {PUBLIC_PROJECTS}
            galleryType = "public"
          />
        )
      },
      {
        name: 'Personal Gallery',
        description: 'Personal gallery sorted by recency of when the project was added.',
        story: () => (
          <ProjectCardGrid
            projects = {PERSONAL_PROJECTS}
            galleryType = "personal"
          />
        )
      },
    ]);
};
