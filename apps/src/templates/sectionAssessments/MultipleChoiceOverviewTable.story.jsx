import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';
import commonMsg from '@cdo/locale';

const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 40, isCorrectAnswer: true},
               {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 20, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 20, isCorrectAnswer: false},
    ],
    notAnswered: 10,
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)?',
    answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 30, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 10, isCorrectAnswer: true},
               {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 10, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 20, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionF(), percentAnswered: 10, isCorrectAnswer: false},
    ],
    notAnswered: 30,
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?',
    answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 50, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 15, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 20, isCorrectAnswer: true},
               {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 5, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
    ],
    notAnswered: 5,
  },
  {
    id: 4,
    question: '4. What is a function?',
    answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
               {multipleChoiceOption: commonMsg.answerOptionF(), percentAnswered: 32, isCorrectAnswer: true},
               {multipleChoiceOption: commonMsg.answerOptionG(), percentAnswered: 5, isCorrectAnswer: false},
    ],
    notAnswered: 0,
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MultipleChoiceOverviewTable', module)
    .addStoryTable([
      {
        name: 'Assessment multiple choice with 7 answers',
        description: 'Ability to see assessment overview for a section',
        story: () => (
            <MultipleChoiceOverviewTable
              questionAnswerData={multipleChoiceData}
            />
        )
      },
      {
        name: 'Assessment multiple choice with 3 answers',
        description: 'Ability to see assessment overview for a section',
        story: () => (
            <MultipleChoiceOverviewTable
              questionAnswerData={multipleChoiceData.map(question => {
                return {
                  ...question,
                  answers: question.answers.slice(0,2),
                };
              })}
            />
        )
      },
    ]);
};
