import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';

const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    percentAnsweredOptionOne: '80%',
    percentAnsweredOptionTwo: '15%',
    notAnswered: '5%',
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)',
    percentAnsweredOptionOne: '20%',
    percentAnsweredOptionTwo: '60%',
    notAnswered: '20%'
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet',
    percentAnsweredOptionOne: '35%',
    percentAnsweredOptionTwo: '65%',
    notAnswered: '0%'
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
