import React from 'react';
import ProjectCardGrid from './ProjectCardGrid';
import _ from 'lodash';

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
  const date = new Date();
  const publicProjects = {};
    projectTypes.forEach(type => {
      publicProjects[type] = _.range(5).map(i => (
        generateFakeProject({
          type: type,
          name: type,
          publishedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
          studentName: 'Penelope',
          studentAge: 6 + 3 * i
        })
      ));
    });
  return publicProjects;
}

function generateFakePublicProjectsWithoutStudentInfo() {
  const date = new Date();
  const publicProjects = {};
  projectTypes.forEach(type => {
    publicProjects[type] = _.range(5).map(i => (
      generateFakeProject({
        type: type,
        name: type,
        publishedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      })
    ));
  });
  return publicProjects;
}

function generateFakePersonalProjects() {
  const date = new Date();
  const personalProjects = {};
  personalProjects.applab = _.range(7).map(i => (
    generateFakeProject({
      name: "Personal " + i,
      updatedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      studentName: 'Penelope',
      studentAge: 8,
    })
  ));
  return personalProjects;
}

function generateFakeClassProjects() {
  const classProjects = {};
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
        description: 'Class gallery, showing full names',
        story: () => (
          <ProjectCardGrid
            projectLists = {generateFakeClassProjects()}
            galleryType = "class"
          />
        )
      },
      {
        name: 'Public Gallery with student info',
        description: 'Public gallery, with shortened student names and student age ranges.',
        story: () => (
          <ProjectCardGrid
            projectLists = {generateFakePublicProjectsWithStudentInfo()}
            galleryType = "public"
          />
        )
      },
      {
        name: 'Public Gallery without student info',
        description: 'Public gallery, without student name and age.',
        story: () => (
          <ProjectCardGrid
            projectLists = {generateFakePublicProjectsWithoutStudentInfo()}
            galleryType = "public"
          />
        )
      },
      {
        name: 'Personal Gallery',
        description: 'Personal gallery, showing full names and the "quick action" dropdowns',
        story: () => (
          <ProjectCardGrid
            projectLists = {generateFakePersonalProjects()}
            galleryType = "personal"
          />
        )
      },
    ]);
};
