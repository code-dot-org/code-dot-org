import React from 'react';

import {
  studentMCData,
  multipleChoiceDataForSingleStudent,
} from './assessmentsTestHelpers';
import MultipleChoiceByStudentTable from './MultipleChoiceByStudentTable';

export default {
  component: MultipleChoiceByStudentTable,
};

export const Primary = () => (
  <MultipleChoiceByStudentTable
    questionAnswerData={multipleChoiceDataForSingleStudent}
    studentAnswerData={studentMCData}
  />
);
