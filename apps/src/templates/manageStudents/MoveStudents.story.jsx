import React from 'react';
import {UnconnectedMoveStudents as MoveStudents} from './MoveStudents';
import {
  blankStudentTransfer,
  blankStudentTransferStatus,
  TransferStatus
} from './manageStudentsRedux';

const studentData = [
  {
    id: 1,
    name: 'Student A'
  },
  {
    id: 3,
    name: 'Student C'
  },
  {
    id: 2,
    name: 'Student B'
  }
];

const sections = [
  {
    id: 1,
    name: 'Section A'
  },
  {
    id: 2,
    name: 'Section B'
  },
  {
    id: 3,
    name: 'Section C'
  }
];

const transferToOtherTeacher = {
  ...blankStudentTransfer,
  studentIds: [1,2,3],
  otherTeacher: true,
  otherTeacherSection: 'ABCDEF',
  copyStudents: false
};

const errorTransferStatus = {
  status: TransferStatus.FAIL,
  error: 'You cannot move these students because they are already in the new section.'
};

export default storybook => {
  storybook
    .storiesOf('MoveStudents', module)
    .addStoryTable([
      {
        name: 'Move students dialog',
        description: 'Empty dialog',
        story: () => (
          <MoveStudents
            studentData={studentData}
            transferData={blankStudentTransfer}
            transferStatus={blankStudentTransferStatus}
            currentSectionId={1}
            sections={sections}
            updateStudentTransfer={() => console.log('updating...')}
            transferStudents={() => console.log('transferring...')}
            cancelStudentTransfer={() => console.log('cancelling...')}
          />
        )
      },
      {
        name: 'Move students dialog',
        description: 'Dialog when "other teacher" option is chosen',
        story: () => (
          <MoveStudents
            studentData={studentData}
            transferData={transferToOtherTeacher}
            transferStatus={blankStudentTransferStatus}
            currentSectionId={1}
            sections={sections}
            updateStudentTransfer={() => console.log('updating...')}
            transferStudents={() => console.log('transferring...')}
            cancelStudentTransfer={() => console.log('cancelling...')}
          />
        )
      },
      {
        name: 'Move students dialog',
        description: 'Dialog when an error has occurred',
        story: () => (
          <MoveStudents
            studentData={studentData}
            transferData={transferToOtherTeacher}
            transferStatus={errorTransferStatus}
            currentSectionId={1}
            sections={sections}
            updateStudentTransfer={() => console.log('updating...')}
            transferStudents={() => console.log('transferring...')}
            cancelStudentTransfer={() => console.log('cancelling...')}
          />
        )
      }
    ]);
};
