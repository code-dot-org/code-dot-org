import React from 'react';
import Congrats from './Congrats';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'Congrats/Congrats',
  component: Congrats
};

const Template = args => (
  <Provider store={reduxStore()}>
    <Congrats
      initialCertificateImageUrl={'/images/placeholder-hoc-image.jpg'}
      {...args}
    />
  </Provider>
);

export const CongratsAppLabSignedOut = Template.bind({});
CongratsAppLabSignedOut.args = {
  tutorial: 'applab-intro',
  userType: 'signedOut',
  language: 'en'
};

export const CongratsAppLabStudent = Template.bind({});
CongratsAppLabStudent.args = {
  ...CongratsAppLabSignedOut.args,
  userType: 'student'
};

export const CongratsMinecraftPre2017SignedOut = Template.bind({});
CongratsMinecraftPre2017SignedOut.args = {
  userType: 'signedOut',
  tutorial: 'minecraft',
  language: 'en'
};

export const CongratsMinecraftPre2017Student = Template.bind({});
CongratsMinecraftPre2017Student.args = {
  ...CongratsMinecraftPre2017SignedOut.args,
  userType: 'student'
};

export const CongratsMinecraft2017SignedOut = Template.bind({});
CongratsMinecraft2017SignedOut.args = {
  userType: 'signedOut',
  tutorial: 'hero',
  language: 'en'
};

export const CongratsMinecraft2017Student = Template.bind({});
CongratsMinecraft2017Student.args = {
  ...CongratsMinecraft2017SignedOut.args,
  userType: 'student'
};

export const CongratsMinecraft2017StudentKorean = Template.bind({});
CongratsMinecraft2017StudentKorean.args = {
  userType: 'student',
  tutorial: 'hero',
  language: 'ko'
};

export const CongratsMinecraft2018SignedOut = Template.bind({});
CongratsMinecraft2018SignedOut.args = {
  userType: 'signedOut',
  tutorial: 'aquatic',
  language: 'en'
};

export const CongratsOtherSignedOut = Template.bind({});
CongratsOtherSignedOut.args = {
  tutorial: 'other',
  userType: 'signedOut',
  language: 'en'
};

export const CongratsOtherStudent = Template.bind({});
CongratsOtherStudent.args = {
  ...CongratsOtherSignedOut.args,
  userType: 'student'
};

export const CongratsOtherTeacher = Template.bind({});
CongratsOtherTeacher.args = {
  ...CongratsOtherSignedOut.args,
  userType: 'teacher'
};
