import React from 'react';
import ProjectCardGrid from './ProjectCardGrid';

let projectTypes = [
  'applab',
  'gamelab',
  'artist',
  'playlab',
  'weblab'
];

const defaultProject = {
  projectData: {
    channel: 'ABCDEFGHIJKLM01234',
    projectName: 'Puppy Playdate',
    studentName: 'Penelope',
    studentAge: 8,
    type: 'applab',
    updatedAt: '2016-10-31T23:59:59.999-08:00',
    publishedToPublic: true,
    publishedToClass: false
  },
  currentGallery: "public"
};

function generateFakeProject(overrideData) {
  return {
    ...defaultProject,
    projectData: {
      ...defaultProject.projectData,
      ...overrideData
    },
    currentGallery: {
      ...defaultProject.currentGallery,
      ...overrideData
    }
  };
}

function generateFakePublicProjects() {
  let publicProjects = [];
  let i = 0;
    projectTypes.forEach(type => {
      for (i=0; i < 5; i++) {
        publicProjects.push(generateFakeProject({type: type, projectName: type}));
      }
    });
  return publicProjects;
}


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
            projects = {generateFakePublicProjects()}
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
