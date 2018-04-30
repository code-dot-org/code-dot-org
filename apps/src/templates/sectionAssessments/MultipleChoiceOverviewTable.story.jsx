import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';

const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers: [80, 15],
    percentAnsweredOptionOne: '35%',
    optionOneIsCorrect: true,
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)',
    answers: [20, 60, 10, 3, 5 , 6],
    percentAnsweredOptionOne: '35%',
    optionOneIsCorrect: true,
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet',
    answers: [40, 35, 5, 5],
    percentAnsweredOptionOne: '35%',
    optionOneIsCorrect: true,
  },
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
