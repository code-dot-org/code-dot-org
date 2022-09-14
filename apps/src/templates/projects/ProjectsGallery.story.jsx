import React from 'react';
import ProjectsGallery from './ProjectsGallery';
import {Galleries} from './projectConstants';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

const Template = args => (
  <Provider store={reduxStore()}>
    <ProjectsGallery canShare limitedGallery {...args} />;
  </Provider>
);

export const MyProjectsSelected = Template.bind({});
MyProjectsSelected.args = {
  selectedGallery: Galleries.PRIVATE
};

export const PublicGallerySelected = Template.bind({});
PublicGallerySelected.args = {
  selectedGallery: Galleries.PUBLIC
};
