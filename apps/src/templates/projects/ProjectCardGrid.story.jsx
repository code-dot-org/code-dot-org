import React from 'react';
import ProjectCardGrid from './ProjectCardGrid';

let projectTypes = [
  'applab',
  'gamelab',
  'artist',
  'playlab',
];

const defaultProject = {
  projectData: {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Puppy Playdate',
    type: 'applab',
    publishedAt: '2016-10-31T23:59:59.999-08:00',
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

function generateFakePublicProjectsWithStudentInfo() {
  let date = new Date();
  let publicProjects = {};
  let i = 0;
    projectTypes.forEach(type => {
      publicProjects[type] = [];
      for (i=0; i < 5; i++) {
        publicProjects[type].push(generateFakeProject({
          type: type,
          name: type,
          publishedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
          studentName: 'Penelope',
          studentAge: 6 + 3 * i
        }));
      }
    });
  return publicProjects;
}

function generateFakePublicProjectsWithoutStudentInfo() {
  let date = new Date();
  let publicProjects = {};
  let i = 0;
  projectTypes.forEach(type => {
    publicProjects[type] = [];
    for (i=0; i < 5; i++) {
      publicProjects[type].push(generateFakeProject({
        type: type,
        name: type,
        publishedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      }));
    }
  });
  return publicProjects;
}

function generateFakePersonalProjects() {
  let date = new Date();
  let personalProjects = {};
  personalProjects.applab = [];
  let i = 1;
  for (i=1; i < 8; i++) {
    personalProjects.applab.push(generateFakeProject({
      name: "Personal " + i,
      updatedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      studentName: 'Penelope',
      studentAge: 8,
    }));
  }
  return personalProjects;
}

function generateFakeClassProjects() {
  let classProjects = {};
  classProjects.applab = [];
  classProjects.applab.push(generateFakeProject());
  classProjects.applab.push(generateFakeProject({
    name: "Mouse Maze",
    studentName: "Maisy",
    studentAge: 8,
  }));
  classProjects.applab.push(generateFakeProject({
    name: "Furry Frenzy",
    studentName: "Felix",
    studentAge: 8,
  }));
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
            projectLists = {generateFakeClassProjects()}
            galleryType = "class"
          />
        )
      },
      {
        name: 'Public Gallery with student info',
        description: 'Public gallery sorted by project type AND recency of when the project was added, without student name and age.',
        story: () => (
          <ProjectCardGrid
            projectLists = {generateFakePublicProjectsWithStudentInfo()}
            galleryType = "public"
          />
        )
      },
      {
        name: 'Public Gallery without student info',
        description: 'Public gallery sorted by project type AND recency of when the project was added, without student name and age.',
        story: () => (
          <ProjectCardGrid
            projectLists = {generateFakePublicProjectsWithoutStudentInfo()}
            galleryType = "public"
          />
        )
      },
      {
        name: 'Personal Gallery',
        description: 'Personal gallery sorted by recency of when the project was added.',
        story: () => (
          <ProjectCardGrid
            projectLists = {generateFakePersonalProjects()}
            galleryType = "personal"
          />
        )
      },
    ]);
};
