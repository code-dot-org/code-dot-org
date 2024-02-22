import React from 'react';
import ChildAccountConsent from './ChildAccountConsent';

export default {
  component: ChildAccountConsent,
};

const Template = args => <ChildAccountConsent {...args} />;

export const ValidToken = Template.bind({});
ValidToken.args = {
  permissionGranted: true,
  permissionGrantedDate: new Date(),
};

export const ExpiredToken = Template.bind({});
ExpiredToken.args = {};
