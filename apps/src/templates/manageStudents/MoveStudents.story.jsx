import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedMoveStudents as MoveStudents} from './MoveStudents';
import {
  blankStudentTransfer,
  blankStudentTransferStatus,
  TransferStatus
} from './manageStudentsRedux';

const studentData = [
  {id: 1, name: 'Student A'},
  {id: 3, name: 'Student C'},
  {id: 2, name: 'Student B'}
];

const sections = [
  {id: 1, name: 'Section A', loginType: 'email'},
  {id: 2, name: 'Section B', loginType: 'word'},
  {id: 3, name: 'Section C', loginType: 'picture'}
];

const transferToOtherTeacher = {
  ...blankStudentTransfer,
  studentIds: [1, 2, 3],
  otherTeacher: true,
  otherTeacherSection: 'ABCDEF',
  copyStudents: false
};

const errorTransferStatus = {
  status: TransferStatus.FAIL,
  error:
    'You cannot move these students because they are already in the new section.'
};

const DEFAULT_PROPS = {
  studentData,
  transferData: blankStudentTransfer,
  transferStatus: blankStudentTransferStatus,
  currentSectionId: 1,
  sections,
  updateStudentTransfer: action('Update'),
  transferStudents: action('Transfer'),
  cancelStudentTransfer: action('Cancel')
};

export default storybook => {
  storybook.storiesOf('MoveStudents', module).addStoryTable([
    {
      name: 'Move students empty dialog',
      story: () => <MoveStudents {...DEFAULT_PROPS} />
    },
    {
      name: 'Move students dialog when "other teacher" option is chosen',
      story: () => (
        <MoveStudents
          {...DEFAULT_PROPS}
          transferData={transferToOtherTeacher}
        />
      )
    },
    {
      name: 'Move students dialog when an error has occurred',
      story: () => (
        <MoveStudents
          {...DEFAULT_PROPS}
          transferData={transferToOtherTeacher}
          transferStatus={errorTransferStatus}
        />
      )
    }
  ]);
};
