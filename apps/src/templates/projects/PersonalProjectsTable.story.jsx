import React from 'react';
import {Provider} from 'react-redux';

import deleteDialog from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';
import frozenProjectInfoDialog from '@cdo/apps/templates/projects/frozenProjectInfoDialog/frozenProjectInfoDialogRedux';
import {reduxStore} from '@cdo/storybook/decorators';

import {stubFakePersonalProjectData} from './generateFakeProjects';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from './PersonalProjectsTable';
export default {
  component: PersonalProjectsTable,
};

const Template = args => (
  <Provider store={reduxStore({deleteDialog, frozenProjectInfoDialog})}>
    <PersonalProjectsTable {...args} />
  </Provider>
);

export const WithProjects = Template.bind({});
WithProjects.args = {
  personalProjectsList: stubFakePersonalProjectData,
  isLoadingPersonalProjectsList: false,
  isUserSignedIn: true,
};

export const WithoutProjects = Template.bind({});
WithoutProjects.args = {
  personalProjectsList: [],
  isLoadingPersonalProjectsList: false,
  isUserSignedIn: true,
};
