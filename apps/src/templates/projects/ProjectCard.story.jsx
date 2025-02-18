import React from 'react';

import ProjectCard from './ProjectCard';

export default {component: ProjectCard};

const defaultData = {
  channel: 'abcdef',
  name: 'Puppy Playdate',
  studentName: 'Penelope',
  studentAgeRange: '8+',
  type: 'applab',
  publishedAt: new Date(),
  updatedAt: new Date(),
};

const Template = args => <ProjectCard projectData={defaultData} {...args} />;

export const PublicAllAppTypes = Template.bind({});
PublicAllAppTypes.args = {
  currentGallery: 'public',
  isDetailView: false,
};

export const PublicSingleAppTypeDetails = Template.bind({});
PublicSingleAppTypeDetails.args = {
  currentGallery: 'public',
  isDetailView: true,
};

export const Personal = Template.bind({});
Personal.args = {
  currentGallery: 'personal',
  isDetailView: true,
};
