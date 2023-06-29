import React from 'react';
import {UnconnectedMatchAssessmentsOverviewTable} from './MatchAssessmentsOverviewTable';
import {
  matchQuestionWith2Pairs,
  matchQuestionWith4Pairs,
} from './assessmentsTestHelpers';

export default {
  title: 'MatchAssessmentsOverviewTable',
  component: UnconnectedMatchAssessmentsOverviewTable,
};

const Template = args => (
  <UnconnectedMatchAssessmentsOverviewTable
    openDialog={() => {}}
    setQuestionIndex={() => {}}
    {...args}
  />
);

export const With4OptionAnswerPairs = Template.bind({});
With4OptionAnswerPairs.args = {
  questionAnswerData: matchQuestionWith4Pairs,
};

export const With2OptionAnswerPairs = Template.bind({});
With2OptionAnswerPairs.args = {
  questionAnswerData: matchQuestionWith2Pairs,
};
