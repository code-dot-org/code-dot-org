import React from 'react';
import ProjectCardGrid from './ProjectCardGrid';
import _ from 'lodash';
import {selectedGallery, selectGallery} from './projectsModule';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {Galleries} from './projectConstants';

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

const hasOlderProjects = {
  applab: true,
  gamelab: true,
  playlab: true,
  artist: true,
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
          studentAgeRange: '13+'
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
      studentAgeRange: '8+',
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
    studentAgeRange: '8+',
  }));
  classProjects.applab.push(generateFakeProject({
    name: "Furry Frenzy",
    studentName: "Felix",
    studentAgeRange: '8+',
  }));
  return classProjects;
}

const createProjectsStore = function () {
  return createStore(combineReducers({
    selectedGallery: selectedGallery
  }));
};


export default storybook => {
  storybook
    .storiesOf('ProjectCardGrid', module)
    .addStoryTable([
      {
        name: 'Public Gallery with student info',
        description: 'Public gallery, with shortened student names and student age ranges.',
        story: () => {
          const store = createProjectsStore();
          store.dispatch(selectGallery(Galleries.PUBlIC));
          return (
            <Provider store={store}>
              <ProjectCardGrid
                projectLists = {generateFakePublicProjectsWithStudentInfo()}
                hasOlderProjects = {hasOlderProjects}
                fetchOlderProjects = {storybook.action('fetchOlderProjects')}
                galleryType = "public"
              />
            </Provider>
          );
        }
      },
      {
        name: 'Public Gallery without student info',
        description: 'Public gallery, without student name and age.',
        story: () => {
          const store = createProjectsStore();
          store.dispatch(selectGallery(Galleries.PUBlIC));
          return (
            <Provider store={store}>
              <ProjectCardGrid
                projectLists = {generateFakePublicProjectsWithoutStudentInfo()}
                hasOlderProjects = {hasOlderProjects}
                fetchOlderProjects = {storybook.action('fetchOlderProjects')}
                galleryType = "public"
              />
            </Provider>
          );
        }
      },
      {
        name: 'Class Gallery',
        description: 'Class gallery, showing full names',
        story: () => {
          const store = createProjectsStore();
          store.dispatch(selectGallery(Galleries.PUBlIC));
          return (
            <Provider store={store}>
              <ProjectCardGrid
                projectLists = {generateFakeClassProjects()}
                hasOlderProjects = {hasOlderProjects}
                fetchOlderProjects = {storybook.action('fetchOlderProjects')}
                galleryType = "class"
              />
            </Provider>
          );
        }
      },
      {
        name: 'Personal Gallery',
        description: 'Personal gallery, showing full names and the "quick action" dropdowns',
        story: () => {
          const store = createProjectsStore();
          store.dispatch(selectGallery(Galleries.PUBlIC));
          return (
            <Provider store={store}>
              <ProjectCardGrid
                projectLists = {generateFakePersonalProjects()}
                hasOlderProjects = {hasOlderProjects}
                fetchOlderProjects = {storybook.action('fetchOlderProjects')}
                galleryType = "personal"
              />
            </Provider>
          );
        }
      },
    ]);
};
