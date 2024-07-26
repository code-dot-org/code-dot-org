import React from 'react';

import {surveyOne} from './assessmentsTestHelpers';
import FreeResponsesSurveyTable from './FreeResponsesSurveyTable';

export default {
  component: FreeResponsesSurveyTable,
};

const Template = args => <FreeResponsesSurveyTable {...args} />;

export const SurveyOne = Template.bind({});
SurveyOne.args = {
  freeResponses: surveyOne,
};
