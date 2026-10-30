import React from 'react';

import {
  matchQuestionWith2Pairs,
  matchQuestionWith4Pairs,
} from './assessmentsTestHelpers';
import {UnconnectedMatchAssessmentsOverviewTable} from './MatchAssessmentsOverviewTable';

export default {
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
