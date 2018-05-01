import React from 'react';
import {UnconnectedMoveStudents as MoveStudents} from './MoveStudents';
import {blankStudentTransfer} from './manageStudentsRedux';

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

export default storybook => {
  storybook
    .storiesOf('MoveStudents', module)
    .addStoryTable([
      {
        name: 'Move students dialog',
        description: 'Ability to move students in a certain section to a different section or teacher',
        story: () => (
          <MoveStudents
            studentData={studentData}
            transferData={blankStudentTransfer}
            currentSectionId={1}
            sections={sections}
          />
        )
      },
      {
        name: 'Move students dialog',
        description: 'Ability to move students in a certain section to a different section or teacher',
        story: () => (
          <MoveStudents
            studentData={studentData}
            transferData={transferToOtherTeacher}
            currentSectionId={1}
            sections={sections}
          />
        )
      }
    ]);
};
