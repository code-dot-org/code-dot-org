import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import ChildAccountConsent from './index';

export default {
  component: ChildAccountConsent,
} as Meta;

const Template: StoryFn<typeof ChildAccountConsent> = args => (
  <ChildAccountConsent {...args} />
);

export const ValidToken = Template.bind({});
ValidToken.args = {
  permissionGranted: true,
  permissionGrantedDate: new Date(),
};

export const ExpiredToken = Template.bind({});
ExpiredToken.args = {};
