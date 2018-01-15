import React from 'react';
import {UnconnectedManageStudentsTable} from './ManageStudentsTable';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

// Student names out of alphabetical order to demonstrate
// sorting functionality in the storybook
const passwordAccountData = [
  {
    id: 1,
    name: 'StudentNameA',
    username: 'student1',
    userType: 'student',
    age: 17,
    gender: 'f',
    loginType: SectionLoginType.email,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'StudentNameC',
    username: 'student2',
    userType: 'student',
    age: 14,
    gender: 'm',
    loginType: SectionLoginType.email,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 3,
    name: 'StudentNameD',
    username: 'student3',
    userType: 'student',
    age: 9,
    gender: 'm',
    loginType: SectionLoginType.email,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  }
];

const wordAccountData = [
  {
    id: 1,
    name: 'StudentNameC',
    username: 'student1',
    userType: 'student',
    age: 12,
    gender: 'f',
    loginType: SectionLoginType.word,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'StudentNameA',
    username: 'student2',
    userType: 'student',
    age: 16,
    gender: 'm',
    loginType: SectionLoginType.word,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 3,
    name: 'StudentNameB',
    username: 'student3',
    userType: 'student',
    age: 10,
    gender: 'f',
    loginType: SectionLoginType.word,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  }
];

const pictureAccountData = [
  {
    id: 1,
    name: 'StudentNameA',
    username: 'student1',
    userType: 'student',
    age: 13,
    gender: 'f',
    loginType: SectionLoginType.picture,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'StudentNameB',
    username: 'student2',
    userType: 'student',
    age: 6,
    gender: 'm',
    loginType: SectionLoginType.picture,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 3,
    name: 'StudentNameC',
    username: 'student3',
    userType: 'student',
    age: 11,
    gender: 'f',
    loginType: SectionLoginType.picture,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  }
];

const googleData = [
  {
    id: 1,
    name: 'StudentNameA',
    username: 'student1',
    userType: 'student',
    age: 13,
    gender: 'f',
    loginType: SectionLoginType.google_classroom,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'StudentNameB',
    username: 'student2',
    userType: 'student',
    age: 6,
    gender: 'm',
    loginType: SectionLoginType.google_classroom,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  }
];

const cleverData = [
  {
    id: 1,
    name: 'StudentNameB',
    username: 'student1',
    userType: 'student',
    age: 13,
    gender: 'f',
    loginType: SectionLoginType.clever,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'StudentNameA',
    username: 'student2',
    userType: 'student',
    age: 6,
    gender: 'm',
    loginType: SectionLoginType.clever,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  }
];

export default storybook => {
  storybook
    .storiesOf('ManageStudentsTable', module)
    .addStoryTable([
      {
        name: 'Table for email accounts',
        description: 'Ability to edit/delete all data including the password',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={passwordAccountData}
            id={53}
            loginType={SectionLoginType.email}
          />
        )
      },
      {
        name: 'Table for word accounts',
        description: 'Ability to edit/delete all data and reset the secret word',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={wordAccountData}
            id={53}
            loginType={SectionLoginType.word}
          />
        )
      },
      {
        name: 'Table for picture accounts',
        description: 'Ability to edit/delete all data and reset the secret picture',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={pictureAccountData}
            id={53}
            loginType={SectionLoginType.picture}
          />
        )
      },
      {
        name: 'Table for Google accounts',
        description: 'Read only table',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={googleData}
            id={53}
            loginType={SectionLoginType.google_classroom}
          />
        )
      },
      {
        name: 'Table for Clever accounts',
        description: 'Ready only table',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={cleverData}
            id={53}
            loginType={SectionLoginType.clever}
          />
        )
      },
    ]);
};
