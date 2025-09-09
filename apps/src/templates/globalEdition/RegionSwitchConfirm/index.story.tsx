import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import RegionSwitchConfirm from './index';

export default {
  component: RegionSwitchConfirm,
} as Meta;

const Template: StoryFn<typeof RegionSwitchConfirm> = args => (
  <RegionSwitchConfirm {...args} code="fa" name="Farsi" />
);

export const Default = Template.bind({});
Default.args = {};
