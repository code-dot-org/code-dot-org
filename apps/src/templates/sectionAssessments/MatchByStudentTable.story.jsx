import React from 'react';
import MatchByStudentTable from './MatchByStudentTable';
import {matchDataForSingleStudent} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MatchByStudentTable', module)
    .addStoryTable([
      {
        name: 'Student Overview',
        description:
          'Ability to see match assessment overview for a single student',
        story: () => (
          <MatchByStudentTable
            questionAnswerData={matchDataForSingleStudent}
            studentAnswerData={{responses: [0, 1]}}
          />
        )
      }
    ]);
};
