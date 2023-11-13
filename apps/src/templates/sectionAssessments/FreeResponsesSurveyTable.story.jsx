import React from 'react';
import FreeResponsesSurveyTable from './FreeResponsesSurveyTable';
import {surveyOne} from './assessmentsTestHelpers';

export default {
  title: 'FreeResponsesSurveyTable',
  component: FreeResponsesSurveyTable,
};

const Template = args => <FreeResponsesSurveyTable {...args} />;

export const SurveyOne = Template.bind({});
SurveyOne.args = {
  freeResponses: surveyOne,
};
