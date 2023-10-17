import React from 'react';
import MultipleChoiceByStudentTable from './MultipleChoiceByStudentTable';
import {
  studentMCData,
  multipleChoiceDataForSingleStudent,
} from './assessmentsTestHelpers';

export default {
  title: 'MultipleChoiceByStudentTable',
  component: MultipleChoiceByStudentTable,
};

export const Primary = () => (
  <MultipleChoiceByStudentTable
    questionAnswerData={multipleChoiceDataForSingleStudent}
    studentAnswerData={studentMCData}
  />
);
