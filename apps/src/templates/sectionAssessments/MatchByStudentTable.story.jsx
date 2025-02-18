import React from 'react';

import {matchDataForSingleStudent} from './assessmentsTestHelpers';
import MatchByStudentTable from './MatchByStudentTable';

export default {
  component: MatchByStudentTable,
};

//
// TEMPLATE
//

const Template = args => <MatchByStudentTable {...args} />;

//
// STORIES
//

export const Default = Template.bind({});
Default.args = {
  questionAnswerData: matchDataForSingleStudent,
  studentAnswerData: {responses: [0, 1]},
};
