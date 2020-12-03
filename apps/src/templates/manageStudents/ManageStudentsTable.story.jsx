import React from 'react';
import {UnconnectedManageStudentsTable} from './ManageStudentsTable';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import manageStudents, {
  RowType,
  blankStudentTransfer
} from './manageStudentsRedux';
import teacherSections from '../teacherDashboard/teacherSectionsRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';

const initialState = {
  manageStudents: {
    loginType: '',
    studentData: {},
    addStatus: {}
  },
  sectionData: {
    section: {
      id: 53
    }
  },
  scriptSelection: {
    scriptId: 22,
    validScripts: [{id: 22, script_name: 'allthethings'}]
  }
};

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
    isEditing: false,
    rowType: RowType.STUDENT
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
    isEditing: false,
    rowType: RowType.STUDENT
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
    isEditing: false,
    rowType: RowType.STUDENT
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
    isEditing: false,
    rowType: RowType.STUDENT
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
    isEditing: false,
    rowType: RowType.STUDENT
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
    rowType: RowType.STUDENT
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
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    isEditing: false,
    rowType: RowType.STUDENT
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
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    isEditing: false,
    rowType: RowType.STUDENT
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
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    isEditing: false,
    rowType: RowType.STUDENT
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
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    rowType: RowType.STUDENT
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
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    rowType: RowType.STUDENT
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
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    rowType: RowType.STUDENT
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
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    rowType: RowType.STUDENT
  }
];

export default storybook => {
  storybook
    .storiesOf('ManageStudentsTable', module)
    .withReduxStore(
      {manageStudents, teacherSections, sectionData, scriptSelection},
      initialState
    )
    .addStoryTable([
      {
        name: 'Table for email accounts',
        description: 'Ability to edit/delete all data including the password',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={passwordAccountData}
            editingData={{}}
            loginType={SectionLoginType.email}
            addStatus={{}}
            transferData={blankStudentTransfer}
            transferStatus={{}}
            sectionId={53}
            sectionCode="ABCDEF"
            sectionName="My Section"
          />
        )
      },
      {
        name: 'Table for word accounts',
        description:
          'Ability to edit/delete all data and reset the secret word',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={wordAccountData}
            editingData={{}}
            loginType={SectionLoginType.word}
            addStatus={{}}
            transferData={blankStudentTransfer}
            transferStatus={{}}
            sectionId={53}
            sectionCode="ABCDEF"
            sectionName="My Section"
          />
        )
      },
      {
        name: 'Table for picture accounts',
        description:
          'Ability to edit/delete all data and reset the secret picture',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={pictureAccountData}
            editingData={{}}
            loginType={SectionLoginType.picture}
            addStatus={{}}
            transferData={blankStudentTransfer}
            transferStatus={{}}
            sectionId={53}
            sectionCode="ABCDEF"
            sectionName="My Section"
          />
        )
      },
      {
        name: 'Table for Google accounts',
        description: 'Read only table',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={googleData}
            editingData={{}}
            loginType={SectionLoginType.google_classroom}
            addStatus={{}}
            transferData={blankStudentTransfer}
            transferStatus={{}}
            sectionId={53}
            sectionCode="ABCDEF"
            sectionName="My Section"
          />
        )
      },
      {
        name: 'Table for Clever accounts',
        description: 'Ready only table',
        story: () => (
          <UnconnectedManageStudentsTable
            studentData={cleverData}
            editingData={{}}
            loginType={SectionLoginType.clever}
            addStatus={{}}
            transferData={blankStudentTransfer}
            transferStatus={{}}
            sectionId={53}
            sectionCode="ABCDEF"
            sectionName="My Section"
          />
        )
      }
    ]);
};
