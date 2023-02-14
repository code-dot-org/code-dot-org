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
      {...args}
      initialCertificateImageUrl={'/images/placeholder-hoc-image.jpg'}
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

export const Congrats2017MinecraftSignedout = Template.bind({});
Congrats2017MinecraftSignedout.args = {
  userType: 'signedOut',
  tutorial: 'hero',
  language: 'en'
};

export const Congrats2017MinecraftStudent = Template.bind({});
Congrats2017MinecraftStudent.args = {
  ...Congrats2017MinecraftSignedout.args,
  userType: 'student'
};

export const Congrats2017MinecraftStudentKorean = Template.bind({});
Congrats2017MinecraftStudentKorean.args = {
  userType: 'student',
  tutorial: 'hero',
  language: 'ko'
};

export const Congrats2018MinecraftSignedOut = Template.bind({});
Congrats2018MinecraftSignedOut.args = {
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
