import React from 'react';
import NewStudentAccountConsent from './NewStudentAccountConsent';

export default {
  title: 'NewStudentAccountConsent',
  component: NewStudentAccountConsent,
};

const Template = args => <NewStudentAccountConsent {...args} />;

export const ValidToken = Template.bind({});
ValidToken.args = {
  permissionGranted: true,
  permissionGrantedDate: new Date(),
};

export const ExpiredToken = Template.bind({});
ExpiredToken.args = {};
