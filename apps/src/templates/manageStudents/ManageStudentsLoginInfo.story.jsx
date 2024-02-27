// Disabling this rule because we are generating stories in a loop,
// which doesn't play nicely with Storybook's expected behavior around named/default exports.
/* eslint-disable storybook/default-exports */
import React from 'react';
import ManageStudentsLoginInfo from './ManageStudentsLoginInfo';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

const studentData = [
  {
    id: 1,
    name: 'studenta',
    username: 'studenta',
    userType: 'student',
    secretWords: 'secret words',
    secretPicturePath: 'wizard.jpg',
  },
];

const loginTypes = Object.values(SectionLoginType);

const defaultExport = {
  title: 'ManageStudents/ManageStudentsLoginInfo',
  component: ManageStudentsLoginInfo,
};

const Template = args => (
  <ManageStudentsLoginInfo
    sectionId={7}
    sectionCode="ABCDEF"
    sectionName="Name"
    studioUrlPrefix="http://localhost-studio.code.org:3000"
    studentData={studentData}
    {...args}
  />
);

const stories = {};

loginTypes.forEach(loginType => {
  const story = Template.bind({});
  story.args = {
    loginType: loginType,
  };
  stories[`${loginType}`] = story;
});

module.exports = {
  ...stories,
  default: defaultExport,
};
