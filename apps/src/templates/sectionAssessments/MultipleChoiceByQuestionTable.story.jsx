import React from 'react';
import MultipleChoiceByQuestionTable from './MultipleChoiceByQuestionTable';

export default {
  name: 'MultipleChoiceByQuestionTable',
  component: MultipleChoiceByQuestionTable,
};

export const Primary = () => (
  <MultipleChoiceByQuestionTable
    studentAnswers={[
      {name: 'Matt', id: 1, answer: 'B', correct: false},
      {name: 'Kim', id: 2, answer: 'A', correct: true},
      {name: 'Megan', id: 3, answer: 'C', correct: false},
    ]}
  />
);
