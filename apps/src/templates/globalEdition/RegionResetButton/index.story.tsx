import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import RegionResetButton from './index';

export default {
  component: RegionResetButton,
} as Meta;

const Template: StoryFn<typeof RegionResetButton> = args => (
  <RegionResetButton />
);

export const Default = Template.bind({});
Default.args = {};
