import React from 'react';
import ProjectWidget from './ProjectWidget';
import {generateFakePersonalProjects} from './generateFakeProjects';
import {reduxStore} from '../../../.storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'ProjectWidget',
  component: ProjectWidget,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <ProjectWidget projectList={generateFakePersonalProjects(5)} {...args} />
  </Provider>
);

export const Default = Template.bind({});

export const FullList = Template.bind({});
FullList.args = {
  canViewFullList: true,
};

export const FullListWithoutAdvancedTools = Template.bind({});
FullListWithoutAdvancedTools.args = {
  canViewFullList: true,
  canViewAdvancedTools: true,
};
