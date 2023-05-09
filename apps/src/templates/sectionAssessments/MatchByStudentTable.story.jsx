import React from 'react';
import MatchByStudentTable from './MatchByStudentTable';
import {matchDataForSingleStudent} from './assessmentsTestHelpers';

export default {
  title: 'MatchByStudentTable',
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
