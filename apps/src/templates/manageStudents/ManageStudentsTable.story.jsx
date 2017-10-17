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
    loginType: 'password',
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
    loginType: 'password',
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
    loginType: 'password',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sectionId: 53,
  }
];

export default storybook => {
  storybook
    .storiesOf('ManageStudentsTable', module)
    .addStoryTable([
      {
        name: 'Manage Students Table',
        description: 'Table when there are 2 students',
        story: () => (
          <ManageStudentsTable
            studentData={passwordAccountData}
            id={53}
            loginType={"email"}
          />
        )
      },
    ]);
};
