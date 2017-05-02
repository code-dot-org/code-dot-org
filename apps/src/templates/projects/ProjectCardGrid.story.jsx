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
    publishedToClass: true
  },
  currentGallery: "public"
};

function generateFakeProject(overrideData) {
  return {
    ...defaultProject,
    projectData: {
      ...defaultProject.projectData,
      ...overrideData
    }
  };
}

function generateFakePublicProjects() {
  let date = new Date();
  let publicProjects = [];
  let i = 0;
    projectTypes.forEach(type => {
      for (i=0; i < 5; i++) {
        publicProjects.push(generateFakeProject({type: type, projectName: type, updatedAt: date.setDate(date.getDate() - i ), studentAge: 6 + 3*i}));
      }
    });
  return publicProjects;
}

function generateFakePersonalProjects() {
  let date = new Date();
  let personalProjects = [];
  let i = 1;
    for (i=1; i < 8; i++) {
      personalProjects.push(generateFakeProject({projectName: "Personal " + i, updatedAt: date.setDate(date.getDate() - i ) }));
    }
  return personalProjects;
}

function generateFakeClassProjects() {
  let classProjects = [];
  classProjects.push(generateFakeProject());
  classProjects.push(generateFakeProject({projectName: "Mouse Maze", studentName: "Maisy"}));
  classProjects.push(generateFakeProject({projectName: "Furry Frenzy", studentName: "Felix"}));
  return classProjects;
}


export default storybook => {
  storybook
    .storiesOf('ProjectCardGrid', module)
    .addStoryTable([
      {
        name: 'Class Gallery',
        description: 'Class gallery sorted by recency of when the project was added.',
        story: () => (
          <ProjectCardGrid
            projects = {generateFakeClassProjects()}
            galleryType = "class"
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
            projects = {generateFakePersonalProjects()}
            galleryType = "personal"
          />
        )
      },
    ]);
};
