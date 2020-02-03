import React from 'react';
import {UnconnectedMatchAssessmentsOverviewTable} from './MatchAssessmentsOverviewTable';
import {
  matchQuestionWith2Pairs,
  matchQuestionWith4Pairs
} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MatchAssessmentsOverviewTable', module)
    .addStoryTable([
      {
        name: 'Assessment match with 4 option/answer pairs',
        description: 'Ability to see assessment overview for a section',
        story: () => (
          <UnconnectedMatchAssessmentsOverviewTable
            questionAnswerData={matchQuestionWith4Pairs}
            openDialog={() => {}}
            setQuestionIndex={() => {}}
          />
        )
      },
      {
        name: 'Assessment match with 2 option/answer pairs',
        description: 'Ability to see assessment overview for a section',
        story: () => (
          <UnconnectedMatchAssessmentsOverviewTable
            questionAnswerData={matchQuestionWith2Pairs}
            openDialog={() => {}}
            setQuestionIndex={() => {}}
          />
        )
      }
    ]);
};
