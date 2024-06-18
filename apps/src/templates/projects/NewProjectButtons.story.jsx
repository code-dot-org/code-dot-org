import React from 'react';
import {Provider} from 'react-redux';

import i18n from '@cdo/locale';
import {reduxStore} from '@cdo/storybook/decorators';

import NewProjectButtons from './NewProjectButtons';

const Template = args => (
  <Provider store={reduxStore()}>
    <NewProjectButtons {...args} />
  </Provider>
);

const DEFAULT_PROJECT_TYPES_BASIC = ['spritelab', 'artist', 'dance', 'playlab'];

const MINECRAFT_PROJECT_TYPES = [
  'minecraft_adventurer',
  'minecraft_designer',
  'minecraft_hero',
  'minecraft_aquatic',
];

export const DefaultProjectButtons = Template.bind({});
DefaultProjectButtons.args = {
  projectTypes: DEFAULT_PROJECT_TYPES_BASIC,
};

export const MinecraftProjectButtons = Template.bind({});
MinecraftProjectButtons.args = {
  projectTypes: MINECRAFT_PROJECT_TYPES,
  description: i18n.projectGroupMinecraft(),
};

export default {
  component: NewProjectButtons,
};
