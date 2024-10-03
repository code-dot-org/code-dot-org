import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import RegionSwitchConfirm from './index';

export default {
  component: RegionSwitchConfirm,
} as Meta;

const Template: StoryFn<typeof RegionSwitchConfirm> = args => (
  <RegionSwitchConfirm
    {...args}
    country="IR"
    region={{code: 'fa', name: 'Farsi', href: '#'}}
  />
);

export const Default = Template.bind({});
Default.args = {};
