import React from 'react';
import MoveStudents from './MoveStudents';

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

export default storybook => {
  storybook
    .storiesOf('MoveStudents', module)
    .addStoryTable([
      {
        name: 'Move students dialog',
        description: 'Ability to move students in a certain section to a different section or teacher',
        story: () => (
          <MoveStudents studentData={studentData} />
        )
      }
    ]);
};
