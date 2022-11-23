import React from 'react';
import {UnconnectedParentLetter as ParentLetter} from './ParentLetter';
import {SectionLoginType} from '../../util/sharedConstants';
import wizardPng from '../../../static/skins/studio/wizard_thumb.png';

const sampleSection = {
  id: 7,
  code: 'ABCDEF'
};

const sampleStudents = [
  {
    id: 100,
    name: 'Neville',
    secret_picture_path: wizardPng,
    secret_words: 'wizarding world'
  },
  {
    id: 101,
    name: 'Hermione',
    secret_picture_path: wizardPng,
    secret_words: 'wizarding world'
  }
];

export default {
  title: 'ParentLetter',
  component: ParentLetter
};

const GenericTemplate = loginType => (
  <ParentLetter
    section={{
      ...sampleSection,
      loginType: loginType
    }}
    teacherName="Minerva McGonagall"
  />
);

export const GenericPicture = GenericTemplate.bind({});
GenericPicture.loginType = SectionLoginType.picture;

export const GenericWord = GenericTemplate.bind({});
GenericWord.loginType = SectionLoginType.word;

export const GenericEmail = GenericTemplate.bind({});
GenericEmail.loginType = SectionLoginType.email;

export const GenericGoogleClassroom = GenericTemplate.bind({});
GenericGoogleClassroom.loginType = SectionLoginType.google_classroom;

export const GenericClever = GenericTemplate.bind({});
GenericClever.loginType = SectionLoginType.clever;

const PersonalizedTemplate = loginType => (
  <ParentLetter
    section={{
      ...sampleSection,
      loginType: loginType
    }}
    teacherName="Minerva McGonagall"
    students={sampleStudents}
    studentId={'101'}
  />
);

export const PersonalizedPicture = PersonalizedTemplate.bind({});
PersonalizedPicture.loginType = SectionLoginType.picture;

export const PersonalizedWord = PersonalizedTemplate.bind({});
PersonalizedWord.loginType = SectionLoginType.word;

export const PersonalizedEmail = PersonalizedTemplate.bind({});
PersonalizedEmail.loginType = SectionLoginType.email;

export const PersonalizedGoogleClassroom = PersonalizedTemplate.bind({});
PersonalizedGoogleClassroom.loginType = SectionLoginType.google_classroom;

export const PersonalizedClever = PersonalizedTemplate.bind({});
PersonalizedClever.loginType = SectionLoginType.clever;
