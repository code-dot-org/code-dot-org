import React from 'react';
import ProjectsList from './ProjectsList';

export default {
  title: 'ProjectsList',
  component: ProjectsList
};

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00'
  },
  {
    channel: 'AAAABBBBCCCCDDDDEE',
    name: 'Cats and Kittens',
    studentName: 'Charlie',
    thumbnailUrl: '/media/common_images/stickers/cat.png',
    type: 'weblab',
    updatedAt: '2016-11-30T00:00:00.001-08:00'
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Batyote',
    studentName: 'Bob',
    thumbnailUrl: '/media/common_images/stickers/bat.png',
    type: 'gamelab',
    updatedAt: '2017-01-01T00:00:00.001-08:00'
  }
];

const DEFAULT_ARGS = {
  projectsData: STUB_PROJECTS_DATA,
  studioUrlPrefix: 'https://studio.code.org',
  showProjectThumbnails: true
};

const Template = overrideArgs => (
  <ProjectsList {...{...DEFAULT_ARGS, ...overrideArgs}} />
);

// Name of export determines what is shown in storybook entry
export const WithThumbnails = Template.bind({}); // eslint-disable-line no-unused-vars

export const WithoutThumbnails = Template.bind({});
WithoutThumbnails.overrideArgs = {
  showProjectThumbnails: false
};

export const LocalizedWithThumbnails = Template.bind({});
LocalizedWithThumbnails.overrideArgs = {
  localeCode: 'es-MX'
};
