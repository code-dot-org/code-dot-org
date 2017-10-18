import React from 'react';
import ManageStudentsTable from './ManageStudentsTable';

const passwordAccountData = [
  {
    id: 1,
    name: 'Caley',
    username: 'student1',
    userType: 'student',
    age: 17,
    gender: 'f',
    loginType: 'email',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'Mehal',
    username: 'student2',
    userType: 'student',
    age: 14,
    gender: 'm',
    loginType: 'email',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 3,
    name: 'Brad',
    username: 'student3',
    userType: 'student',
    age: 9,
    gender: 'm',
    loginType: 'email',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  }
];

const wordAccountData = [
  {
    id: 1,
    name: 'Sung',
    username: 'student1',
    userType: 'student',
    age: 12,
    gender: 'f',
    loginType: 'word',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'Josh',
    username: 'student2',
    userType: 'student',
    age: 16,
    gender: 'm',
    loginType: 'word',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  },
  {
    id: 3,
    name: 'Tanya',
    username: 'student3',
    userType: 'student',
    age: 10,
    gender: 'f',
    loginType: 'word',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  }
];

const pictureAccountData = [
  {
    id: 1,
    name: 'Sarah',
    username: 'student1',
    userType: 'student',
    age: 13,
    gender: 'f',
    loginType: 'picture',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'Brent',
    username: 'student2',
    userType: 'student',
    age: 6,
    gender: 'm',
    loginType: 'picture',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 3,
    name: 'Marina',
    username: 'student3',
    userType: 'student',
    age: 11,
    gender: 'f',
    loginType: 'picture',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  }
];

const googleData = [
  {
    id: 1,
    name: 'Erin',
    username: 'student1',
    userType: 'student',
    age: 13,
    gender: 'f',
    loginType: 'google',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'Dave',
    username: 'student2',
    userType: 'student',
    age: 6,
    gender: 'm',
    loginType: 'google',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  }
];

const cleverData = [
  {
    id: 1,
    name: 'Mary',
    username: 'student1',
    userType: 'student',
    age: 13,
    gender: 'f',
    loginType: 'clever',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: 'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
  },
  {
    id: 2,
    name: 'Ram',
    username: 'student2',
    userType: 'student',
    age: 6,
    gender: 'm',
    loginType: 'clever',
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
          <ManageStudentsTable
            studentData={passwordAccountData}
            id={53}
            loginType={"email"}
          />
        )
      },
      {
        name: 'Table for word accounts',
        description: 'Ability to edit/delete all data and reset the secret word',
        story: () => (
          <ManageStudentsTable
            studentData={wordAccountData}
            id={53}
            loginType={"word"}
          />
        )
      },
      {
        name: 'Table for picture accounts',
        description: 'Ability to edit/delete all data and reset the secret picture',
        story: () => (
          <ManageStudentsTable
            studentData={pictureAccountData}
            id={53}
            loginType={"picture"}
          />
        )
      },
      {
        name: 'Table for Google accounts',
        description: 'Read only table',
        story: () => (
          <ManageStudentsTable
            studentData={googleData}
            id={53}
            loginType={"google"}
          />
        )
      },
      {
        name: 'Table for Clever accounts',
        description: 'Ready only table',
        story: () => (
          <ManageStudentsTable
            studentData={cleverData}
            id={53}
            loginType={"clever"}
          />
        )
      },
    ]);
};
