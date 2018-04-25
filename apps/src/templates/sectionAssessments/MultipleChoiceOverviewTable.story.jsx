import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';

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
    .storiesOf('SectionAssessments/MultipleChoiceOverviewTable', module)
    .addStoryTable([
      {
        name: 'Table for assessments',
        description: 'Ability to see assessment overview for the entire class',
        story: () => (
            <MultipleChoiceOverviewTable
              questionAnswerData={multipleChoiceData}
            />
        )
      },
    ]);
};
