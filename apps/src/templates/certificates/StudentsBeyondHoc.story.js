import React from 'react';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'Congrats/StudentsBeyondHoc',
  component: StudentsBeyondHoc,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <StudentsBeyondHoc {...args} />
  </Provider>
);

export const OtherTutorialEnglishTeacher = Template.bind({});
OtherTutorialEnglishTeacher.args = {
  completedTutorialType: 'other',
  isEnglish: true,
  userType: 'teacher',
};
export const OtherTutorialEnglishStudentOver13 = Template.bind({});
OtherTutorialEnglishStudentOver13.args = {
  completedTutorialType: 'other',
  isEnglish: true,
  userType: 'student',
  under13: false,
};
export const OtherTutorialEnglishStudentUnder13 = Template.bind({});
OtherTutorialEnglishStudentUnder13.args = {
  ...OtherTutorialEnglishStudentOver13.args,
  under13: true,
};

export const OtherTutorialEnglishSignedOut = Template.bind({});
OtherTutorialEnglishSignedOut.args = {
  completedTutorialType: 'other',
  userType: 'signedOut',
  isEnglish: true,
};

export const OtherTutorialNonEnglishSignedOut = Template.bind({});
OtherTutorialNonEnglishSignedOut.args = {
  ...OtherTutorialEnglishSignedOut.args,
  isEnglish: false,
};

export const ApplabSignedInEnglish = Template.bind({});
ApplabSignedInEnglish.args = {
  completedTutorialType: 'applab',
  userType: 'student',
  isEnglish: true,
};

export const ApplabSignedOutEnglish = Template.bind({});
ApplabSignedOutEnglish.args = {
  ...ApplabSignedInEnglish.args,
  userType: 'signedOut',
};

export const MinecraftPre2017SignedInEnglishUnder13 = Template.bind({});
MinecraftPre2017SignedInEnglishUnder13.args = {
  completedTutorialType: 'pre2017Minecraft',
  userType: 'student',
  isEnglish: true,
  under13: true,
};

export const MinecraftPre2017SignedInEnglishOver13 = Template.bind({});
MinecraftPre2017SignedInEnglishOver13.args = {
  ...MinecraftPre2017SignedInEnglishUnder13.args,
  under13: false,
};

export const MinecraftPre2017SignedInNonEnglish = Template.bind({});
MinecraftPre2017SignedInNonEnglish.args = {
  completedTutorialType: 'pre2017Minecraft',
  userType: 'student',
  isEnglish: false,
};

export const Minecraft2018EnglishYoungStudent = Template.bind({});
Minecraft2018EnglishYoungStudent.args = {
  completedTutorialType: '2018Minecraft',
  userType: 'student',
  isEnglish: true,
  under13: true,
};

export const Minecraft2018EnglishOlderStudent = Template.bind({});
Minecraft2018EnglishOlderStudent.args = {
  ...Minecraft2018EnglishYoungStudent.args,
  under13: false,
};

export const Minecraft2018NonEnglish = Template.bind({});
Minecraft2018NonEnglish.args = {
  completedTutorialType: '2018Minecraft',
  userType: 'student',
  isEnglish: false,
};

export const DanceSignedInEnglish = Template.bind({});
DanceSignedInEnglish.args = {
  completedTutorialType: 'dance',
  userType: 'student',
  isEnglish: true,
};

export const DanceSignedInNonEnglish = Template.bind({});
DanceSignedInNonEnglish.args = {
  ...DanceSignedInEnglish.args,
  isEnglish: false,
};

export const DanceSignedOutEnglish = Template.bind({});
DanceSignedOutEnglish.args = {
  ...DanceSignedInEnglish.args,
  userType: 'signedOut',
};

export const DanceSignedOutNonEnglish = Template.bind({});
DanceSignedOutNonEnglish.args = {
  completedTutorialType: 'dance',
  userType: 'signedOut',
  isEnglish: false,
};
