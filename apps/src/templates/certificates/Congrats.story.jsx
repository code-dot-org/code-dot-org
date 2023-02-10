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
  tutorial: 'applab-intro',
  userType: 'student',
  language: 'en'
};

export const CongratsMinecraftPre2017SignedOut = Template.bind({});
CongratsMinecraftPre2017SignedOut.args = {
  tutorial: 'minecraft',
  language: 'en'
};

export const CongratsMinecraftPre2017Student = Template.bind({});
CongratsMinecraftPre2017Student.args = {
  tutorial: 'minecraft',
  userType: 'student',
  language: 'en'
};

export const Congrats2017MinecraftSignedout = Template.bind({});
Congrats2017MinecraftSignedout.args = {
  tutorial: 'hero',
  language: 'en'
};

export const Congrats2017MinecraftStudent = Template.bind({});
Congrats2017MinecraftStudent.args = {
  tutorial: 'hero',
  userType: 'student',
  language: 'en'
};

export const Congrats2017MinecraftStudentKorean = Template.bind({});
Congrats2017MinecraftStudentKorean.args = {
  tutorial: 'hero',
  userType: 'student',
  language: 'ko'
};

export const Congrats2018MinecraftSignedOut = Template.bind({});
Congrats2018MinecraftSignedOut.args = {
  tutorial: 'aquatic',
  language: 'en'
};

export const CongratsOtherSignedOut = Template.bind({});
CongratsOtherSignedOut.args = {
  language: 'en'
};

export const CongratsOtherStudent = Template.bind({});
CongratsOtherSignedOut.args = {
  userType: 'student',
  language: 'en'
};

export const CongratsOtherTeacher = Template.bind({});
CongratsOtherTeacher.args = {
  userType: 'teacher',
  language: 'en'
};
