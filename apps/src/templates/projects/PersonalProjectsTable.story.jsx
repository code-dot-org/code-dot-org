import React from 'react';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from './PersonalProjectsTable';
import {stubFakePersonalProjectData} from './generateFakeProjects';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'PersonalProjectsTable',
  component: PersonalProjectsTable
};

const Template = args => (
  <Provider store={reduxStore()}>
    <PersonalProjectsTable {...args} />
  </Provider>
);

export const WithProjects = Template.bind({});
WithProjects.args = {
  personalProjectsList: stubFakePersonalProjectData,
  isLoadingPersonalProjectsList: false,
  isUserSignedIn: true,
  canShare: true
};

export const WithoutProjects = Template.bind({});
WithoutProjects.args = {
  personalProjectsList: [],
  isLoadingPersonalProjectsList: false,
  isUserSignedIn: true,
  canShare: true
};
