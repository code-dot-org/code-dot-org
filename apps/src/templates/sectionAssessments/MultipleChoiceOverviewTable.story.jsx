import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';

const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers: [{},{percentAnswered: '40', isCorrectAnswer: true},
                 {percentAnswered: '20', isCorrectAnswer: false},
                 {percentAnswered: '20', isCorrectAnswer: false},
                 {percentAnswered: '20', isCorrectAnswer: false},
    ],
    notAnswered: "5%"
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)?',
    answers: [{},{percentAnswered: '30', isCorrectAnswer: false},
                 {percentAnswered: '10', isCorrectAnswer: true},
                 {percentAnswered: '10', isCorrectAnswer: false},
                 {percentAnswered: '10', isCorrectAnswer: false},
                 {percentAnswered: '20', isCorrectAnswer: false},
                 {percentAnswered: '10', isCorrectAnswer: false},
    ],
    notAnswered: "5%"
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?',
    answers: [{},{percentAnswered: '50', isCorrectAnswer: false},
                 {percentAnswered: '15', isCorrectAnswer: false},
                 {percentAnswered: '20', isCorrectAnswer: true},
                 {percentAnswered: '5', isCorrectAnswer: false},
                 {percentAnswered: '5', isCorrectAnswer: false},
    ],
    notAnswered: "5%"
  },
  {
    id: 4,
    question: '4. What is a function?',
    answers: [{},{percentAnswered: '15', isCorrectAnswer: false},
                 {percentAnswered: '18', isCorrectAnswer: false},
                 {percentAnswered: '10', isCorrectAnswer: false},
                 {percentAnswered: '9', isCorrectAnswer: false},
                 {percentAnswered: '5', isCorrectAnswer: false},
                 {percentAnswered: '45', isCorrectAnswer: true},
                 {percentAnswered: '5', isCorrectAnswer: false},
    ],
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
