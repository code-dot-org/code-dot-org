import React from 'react';

import {
  questionOne,
  questionTwo,
  questionThree,
} from './assessmentsTestHelpers';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';

export default {
  component: FreeResponsesAssessmentsTable,
};

const Template = args => <FreeResponsesAssessmentsTable {...args} />;

export const StudentFreeResponseAnswers = Template.bind({});
StudentFreeResponseAnswers.args = {
  freeResponses: questionOne,
};

export const OneAssessmentCompleted = Template.bind({});
OneAssessmentCompleted.args = {
  freeResponses: questionTwo,
};

export const SubmittedNoResponse = Template.bind({});
SubmittedNoResponse.args = {
  freeResponses: questionThree,
};
