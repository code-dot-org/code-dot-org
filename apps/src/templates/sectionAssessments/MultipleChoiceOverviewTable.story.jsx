import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';

const multipleChoiceData = [
  {
    id: 1,
    question: 'What is a variable?',
    answerOptionOne: '80%',
    answerOptionTwo: '15%',
    notAnswered: '5%',
  },
  {
    id: 2,
    question: 'What is a 4-bit number for the decimal number Ten(10)',
    answerOptionOne: '20%',
    answerOptionTwo: '60%',
    notAnswered: '20%'
  },
  {
    id: 3,
    question: 'What is the minimum number of bits you will need to encode the 26 letters of the alphabet',
    answerOptionOne: '35%',
    answerOptionTwo: '65%',
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
