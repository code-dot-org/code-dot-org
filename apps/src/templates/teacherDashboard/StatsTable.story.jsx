import React from 'react';
import StatsTable from "./StatsTable";

const section = {
  id: 1,
  students: [
    {
      id: 1,
      name: 'Student B',
      total_lines: 1
    },
    {
      id: 2,
      name: 'Student C',
      total_lines: 2
    },
    {
      id: 3,
      name: 'Student A',
      total_lines: 3
    },
  ]
};

const studentsCompletedLevelCount = {
  1: 2,
  2: 3,
  3: 1
};

export default storybook => storybook
  .storiesOf('StatsTable', module)
  .addStoryTable([
    {
      name: 'Teacher dashboard students stats table',
      description: 'By default, a single child is left-aligned',
      story: () => (
        <StatsTable
          section={section}
          studentsCompletedLevelCount={studentsCompletedLevelCount}
        />
      )
    }
  ]);
