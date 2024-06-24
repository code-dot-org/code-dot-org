import React from 'react';
import {Provider} from 'react-redux';

import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import {reduxStore} from '@cdo/storybook/decorators';

import teacherSections from '../teacherDashboard/teacherSectionsRedux';

import manageStudents, {
  RowType,
  blankStudentTransfer,
} from './manageStudentsRedux';
import {UnconnectedManageStudentsTable} from './ManageStudentsTable';

const initialState = {
  manageStudents: {
    loginType: '',
    studentData: {},
    addStatus: {},
  },
  teacherSections: {
    selectedSectionId: 53,
    sections: [
      {
        id: 53,
        name: 'Test section',
        loginType: SectionLoginType.email,
        hidden: false,
      },
    ],
  },
  unitSelection: {
    scriptId: 22,
    coursesWithProgress: [
      {
        id: 11,
        name: 'All the Things *',
        units: [{id: 22, key: 'allthethings'}],
      },
    ],
  },
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
  },
  {
    id: 4,
    name: 'GuestTeacher',
    username: 'teacher1',
    userType: 'teacher',
    age: '21+',
    gender: 'f',
    loginType: SectionLoginType.email,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    isEditing: false,
    rowType: RowType.TEACHER,
  },
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
  },
  {
    id: 4,
    name: 'GuestTeacher',
    username: 'teacher1',
    userType: 'teacher',
    age: '21+',
    gender: 'f',
    loginType: SectionLoginType.word,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    isEditing: false,
    rowType: RowType.TEACHER,
  },
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
  },
  {
    id: 4,
    name: 'GuestTeacher',
    username: 'teacher1',
    userType: 'teacher',
    age: '21+',
    gender: 'f',
    loginType: SectionLoginType.picture,
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath:
      'http://code.org/images/password_images/pirate_thumb@2x.png',
    sectionId: 53,
    isEditing: false,
    rowType: RowType.TEACHER,
  },
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
  },
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
    rowType: RowType.STUDENT,
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
    rowType: RowType.STUDENT,
  },
];

export default {
  title: 'ManageStudents/ManageStudentsTable', // eslint-disable-line storybook/no-title-property-in-meta
  component: UnconnectedManageStudentsTable,
};

const Template = args => (
  <Provider
    store={reduxStore(
      {manageStudents, teacherSections, unitSelection},
      initialState
    )}
  >
    <UnconnectedManageStudentsTable
      editingData={{}}
      addStatus={{}}
      transferData={blankStudentTransfer}
      transferStatus={{}}
      sectionId={53}
      sectionCode="ABCDEF"
      sectionName="My Section"
      {...args}
    />
  </Provider>
);

export const TableForEmailAccounts = Template.bind({});
TableForEmailAccounts.args = {
  studentData: passwordAccountData,
  loginType: SectionLoginType.email,
};

export const TableForWordAccounts = Template.bind({});
TableForWordAccounts.args = {
  studentData: wordAccountData,
  loginType: SectionLoginType.word,
};

export const TableForPictureAccounts = Template.bind({});
TableForPictureAccounts.args = {
  studentData: pictureAccountData,
  loginType: SectionLoginType.picture,
};

export const TableForGoogleAccounts = Template.bind({});
TableForGoogleAccounts.args = {
  studentData: googleData,
  loginType: SectionLoginType.google_classroom,
};

export const TableForCleverAccounts = Template.bind({});
TableForCleverAccounts.args = {
  studentData: cleverData,
  loginType: SectionLoginType.clever,
};
