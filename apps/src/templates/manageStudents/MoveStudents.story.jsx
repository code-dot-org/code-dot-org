import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedMoveStudents as MoveStudents} from './MoveStudents';
import {
  blankStudentTransfer,
  blankStudentTransferStatus,
  TransferStatus,
} from './manageStudentsRedux';

const studentData = [
  {id: 1, name: 'Student A'},
  {id: 3, name: 'Student C'},
  {id: 2, name: 'Student B'},
];

const sections = [
  {id: 1, name: 'Section A', loginType: 'email'},
  {id: 2, name: 'Section B', loginType: 'word'},
  {id: 3, name: 'Section C', loginType: 'picture'},
];

const transferToOtherTeacher = {
  ...blankStudentTransfer,
  studentIds: [1, 2, 3],
  otherTeacher: true,
  otherTeacherSection: 'ABCDEF',
  copyStudents: false,
};

const errorTransferStatus = {
  status: TransferStatus.FAIL,
  error:
    'You cannot move these students because they are already in the new section.',
};

export default {
  title: 'ManageStudents/MoveStudents',
  component: MoveStudents,
};

const Template = args => (
  <MoveStudents
    studentData={studentData}
    sections={sections}
    currentSectionId={1}
    updateStudentTransfer={action('Update')}
    transferStudents={action('Transfer')}
    cancelStudentTransfer={action('Cancel')}
    {...args}
  />
);

export const MoveStudentsEmptyDialog = Template.bind({});
MoveStudentsEmptyDialog.args = {
  transferData: blankStudentTransfer,
  transferStatus: blankStudentTransferStatus,
};

export const MoveStudentsDialogToOtherTeacher = Template.bind({});
MoveStudentsDialogToOtherTeacher.args = {
  transferData: transferToOtherTeacher,
  transferStatus: blankStudentTransferStatus,
};

export const MoveStudentsDialogWithError = Template.bind({});
MoveStudentsDialogWithError.args = {
  transferData: transferToOtherTeacher,
  transferStatus: errorTransferStatus,
};
