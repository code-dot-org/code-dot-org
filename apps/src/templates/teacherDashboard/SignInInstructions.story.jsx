import React from 'react';
import SignInInstructions from './SignInInstructions';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

export default {
  component: SignInInstructions
};

const Template = args => (
  <SignInInstructions
    sectionCode="ABCDEF"
    studioUrlPrefix="http://localhost-studio.code.org:3000"
    {...args}
  />
);

export const Picture = Template.bind({});
Picture.args = {
  loginType: SectionLoginType.picture
};

export const Word = Template.bind({});
Word.args = {
  loginType: SectionLoginType.word
};

export const Email = Template.bind({});
Email.args = {
  loginType: SectionLoginType.email
};

export const GoogleClassroom = Template.bind({});
GoogleClassroom.args = {
  loginType: SectionLoginType.google_classroom
};

export const Clever = Template.bind({});
Clever.args = {
  loginType: SectionLoginType.clever
};
