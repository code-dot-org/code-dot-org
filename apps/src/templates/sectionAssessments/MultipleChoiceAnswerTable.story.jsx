import React from 'react';
import MultipleChoiceAnswerTable from './MultipleChoiceAnswerTable';

// Student names out of alphabetical order to demonstrate
// sorting functionality in the storybook
const multipleChoiceData = [
  {
    id: 1,
    question: 'What is a variable?',
    answerOptionOne: '40%',
    answerOptionTwo: '20%',
  },
  {
    id: 2,
    question: 'What is a 4-bit number for the decimal number Ten(10)',
    answerOptionOne: '40%',
    answerOptionTwo: '20%',
  },
  {
    id: 3,
    question: 'What is the minimum number of bits you will need to encode the 26 letters of the alphabet',
    answerOptionOne: '40%',
    answerOptionTwo: '20%',
  }
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MultipleChoiceAnswerTable', module)
    .addStoryTable([
      {
        name: 'Table for assessments',
        description: 'Ability to see assessment overview for the entire class',
        story: () => (
            <MultipleChoiceAnswerTable
              questionAnswerData={multipleChoiceData}
            />
        )
      },
    ]);
};
