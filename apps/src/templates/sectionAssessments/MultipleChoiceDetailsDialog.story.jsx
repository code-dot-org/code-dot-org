import React from 'react';
import {UnconnectedMultipleChoiceDetailsDialog as MultipleChoiceDetailsDialog} from './MultipleChoiceDetailsDialog';

export default {
  title: 'MultipleChoiceDetailsDialog',
  component: MultipleChoiceDetailsDialog,
};

const Template = args => <MultipleChoiceDetailsDialog {...args} />;

export const Example = Template.bind({});
Example.args = {
  isDialogOpen: true,
  closeDialog: () => {},
  questionAndAnswers: {
    question: 'Hello world. I display *markdown* questions in a dialog.',
    questionType: 'Multi',
    answers: [
      {text: "I'm an answer", letter: 'A', correct: true},
      {text: "I'm another answer", letter: 'B', correct: false},
    ],
  },
  studentAnswers: [
    {name: 'Matt', id: 1, answer: 'B', correct: false},
    {name: 'Kim', id: 2, answer: 'A', correct: true},
    {name: 'Megan', id: 3, answer: 'C', correct: false},
  ],
};
