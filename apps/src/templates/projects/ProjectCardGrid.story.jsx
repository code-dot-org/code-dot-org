import _ from 'lodash';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import ProjectCardGrid from './ProjectCardGrid';
import {Galleries} from './projectConstants';
import projects from './projectsRedux';

let projectTypes = ['applab', 'gamelab', 'artist', 'playlab'];

const defaultProject = {
  projectData: {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Puppy Playdate',
    type: 'applab',
    publishedAt: '2016-10-31T23:59:59.999-08:00',
    publishedToPublic: true,
  },
  currentGallery: 'public',
};

let nextChannelId = 0;

function generateFakeProject(overrideData) {
  return {
    ...defaultProject,
    projectData: {
      ...defaultProject.projectData,
      channel: `${defaultProject.projectData.channel}_${nextChannelId++}`,
      ...overrideData,
    },
  };
}

function generateFakePublicProjectsWithStudentInfo() {
  const date = new Date();
  const publicProjects = {};
  projectTypes.forEach(type => {
    publicProjects[type] = _.range(5).map(i =>
      generateFakeProject({
        type: type,
        name: type,
        publishedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
        studentName: 'Penelope',
        studentAgeRange: '13+',
      })
    );
  });
  return publicProjects;
}

function generateFakePublicProjectsWithoutStudentInfo() {
  const date = new Date();
  const publicProjects = {};
  projectTypes.forEach(type => {
    publicProjects[type] = _.range(5).map(i =>
      generateFakeProject({
        type: type,
        name: type,
        publishedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      })
    );
  });
  return publicProjects;
}

function generateFakePersonalProjects() {
  const date = new Date();
  const personalProjects = {};
  personalProjects.applab = _.range(7).map(i =>
    generateFakeProject({
      name: 'Personal ' + i,
      updatedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      studentName: 'Penelope',
      studentAgeRange: '8+',
    })
  );
  return personalProjects;
}

const createProjectsStore = function (galleryType) {
  return reduxStore({projects}, {projects: {selectedGallery: galleryType}});
};

export default {
  component: ProjectCardGrid,
};

const Template = args => (
  <Provider store={createProjectsStore(args.selectedGallery)}>
    <ProjectCardGrid
      projectLists={args.projectLists}
      galleryType={args.galleryType}
    />
  </Provider>
);

export const PublicGalleryWithStudentInfo = Template.bind({});
PublicGalleryWithStudentInfo.args = {
  selectedGallery: Galleries.PUBLIC,
  projectLists: generateFakePublicProjectsWithStudentInfo(),
  galleryType: 'public',
};

export const PublicGalleryWithoutStudentInfo = Template.bind({});
PublicGalleryWithoutStudentInfo.args = {
  selectedGallery: Galleries.PUBLIC,
  projectLists: generateFakePublicProjectsWithoutStudentInfo(),
  galleryType: 'public',
};

export const PersonalGallery = Template.bind({});
PersonalGallery.args = {
  selectedGallery: Galleries.PUBLIC,
  projectLists: generateFakePersonalProjects(),
  galleryType: 'personal',
};
