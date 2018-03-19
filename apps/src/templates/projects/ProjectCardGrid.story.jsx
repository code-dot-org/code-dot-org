import React from 'react';
import ProjectCardGrid from './ProjectCardGrid';
import _ from 'lodash';
import projects, {selectGallery} from './projectsRedux';
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
  },
  currentGallery: "public"
};

let nextChannelId = 0;

function generateFakeProject(overrideData) {
  return {
    ...defaultProject,
    projectData: {
      ...defaultProject.projectData,
      channel: `${defaultProject.projectData.channel}_${nextChannelId++}`,
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

const createProjectsStore = function () {
  return createStore(combineReducers({projects}));
};


export default storybook => {
  storybook
    .storiesOf('Projects/ProjectCardGrid', module)
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
                galleryType = "public"
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
                galleryType = "personal"
              />
            </Provider>
          );
        }
      },
    ]);
};
