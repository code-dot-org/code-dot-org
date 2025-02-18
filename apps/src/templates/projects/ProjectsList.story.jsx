import React from 'react';

import ProjectsList from './ProjectsList';

export default {
  component: ProjectsList,
};

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00',
  },
  {
    channel: 'AAAABBBBCCCCDDDDEE',
    name: 'Cats and Kittens',
    studentName: 'Charlie',
    thumbnailUrl: '/media/common_images/stickers/cat.png',
    type: 'weblab',
    updatedAt: '2016-11-30T00:00:00.001-08:00',
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Batyote',
    studentName: 'Bob',
    thumbnailUrl: '/media/common_images/stickers/bat.png',
    type: 'gamelab',
    updatedAt: '2017-01-01T00:00:00.001-08:00',
  },
];

const Template = args => (
  <ProjectsList
    projectsData={STUB_PROJECTS_DATA}
    studioUrlPrefix={'https://studio.code.org'}
    showProjectThumbnails
    {...args}
  />
);

export const WithThumbnails = Template.bind({});

export const WithoutThumbnails = Template.bind({});
WithoutThumbnails.args = {
  showProjectThumbnails: false,
};

export const LocalizedWithThumbnails = Template.bind({});
LocalizedWithThumbnails.args = {
  localeCode: 'es-MX',
};
