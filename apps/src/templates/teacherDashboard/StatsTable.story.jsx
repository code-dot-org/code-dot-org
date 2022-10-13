import React from 'react';
import {UnconnectedStatsTable as StatsTable} from './StatsTable';

const students = [
  {
    id: 1,
    name: 'Student B'
  },
  {
    id: 2,
    name: 'Student C'
  },
  {
    id: 3,
    name: 'Student A'
  }
];

const studentsCompletedLevelCount = {
  1: 2,
  2: 3,
  3: 1
};

export default storybook =>
  storybook.storiesOf('StatsTable', module).addStoryTable([
    {
      name: 'Teacher dashboard students stats table',
      description: 'By default, a single child is left-aligned',
      story: () => (
        <StatsTable
          sectionId={1}
          students={students}
          studentsCompletedLevelCount={studentsCompletedLevelCount}
        />
      )
    }
  ]);
