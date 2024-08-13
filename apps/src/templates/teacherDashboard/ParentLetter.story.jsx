import React from 'react';

import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

import wizardPng from '../../../static/skins/studio/wizard_thumb.png';

import {UnconnectedParentLetter as ParentLetter} from './ParentLetter';

const sampleSection = {
  id: 7,
  code: 'ABCDEF',
};

const sampleStudents = [
  {
    id: 100,
    name: 'Neville',
    secret_picture_path: wizardPng,
    secret_words: 'wizarding world',
  },
  {
    id: 101,
    name: 'Hermione',
    secret_picture_path: wizardPng,
    secret_words: 'wizarding world',
  },
];

export default {
  component: ParentLetter,
};

const GenericTemplate = args => (
  <ParentLetter
    section={{
      ...sampleSection,
      loginType: args.loginType,
    }}
    teacherName="Minerva McGonagall"
  />
);

export const GenericPicture = GenericTemplate.bind({});
GenericPicture.args = {loginType: SectionLoginType.picture};

export const GenericWord = GenericTemplate.bind({});
GenericWord.args = {loginType: SectionLoginType.word};

export const GenericEmail = GenericTemplate.bind({});
GenericEmail.args = {loginType: SectionLoginType.email};

export const GenericGoogleClassroom = GenericTemplate.bind({});
GenericGoogleClassroom.args = {loginType: SectionLoginType.google_classroom};

export const GenericClever = GenericTemplate.bind({});
GenericClever.args = {loginType: SectionLoginType.clever};

const PersonalizedTemplate = args => (
  <ParentLetter
    section={{
      ...sampleSection,
      loginType: args.loginType,
    }}
    teacherName="Minerva McGonagall"
    students={sampleStudents}
    studentId={'101'}
  />
);

export const PersonalizedPicture = PersonalizedTemplate.bind({});
PersonalizedPicture.args = {loginType: SectionLoginType.picture};

export const PersonalizedWord = PersonalizedTemplate.bind({});
PersonalizedWord.args = {loginType: SectionLoginType.word};

export const PersonalizedEmail = PersonalizedTemplate.bind({});
PersonalizedEmail.args = {loginType: SectionLoginType.email};

export const PersonalizedGoogleClassroom = PersonalizedTemplate.bind({});
PersonalizedGoogleClassroom.args = {
  loginType: SectionLoginType.google_classroom,
};

export const PersonalizedClever = PersonalizedTemplate.bind({});
PersonalizedClever.args = {loginType: SectionLoginType.clever};
