import React from 'react';
import {UnconnectedMultipleChoiceAssessmentsOverviewTable} from './MultipleChoiceAssessmentsOverviewTable';
import i18n from '@cdo/locale';

const multipleChoiceData = [
  {
    id: 1,
    questionNumber: 1,
    question: 'What is a variable?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), numAnswered: 2, isCorrect: true},
               {multipleChoiceOption: i18n.answerOptionB(), numAnswered: 4, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionC(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionD(), numAnswered: 2, isCorrect: false},
    ],
    notAnswered: 1,
    totalAnswered: 10,
  },
  {
    id: 2,
    questionNumber: 2,
    question: 'What is a 4-bit number for the decimal number Ten(10)?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), numAnswered: 3, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionB(), numAnswered: 1, isCorrect: true},
               {multipleChoiceOption: i18n.answerOptionC(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionD(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionE(), numAnswered: 2, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionF(), numAnswered: 1, isCorrect: false},
    ],
    notAnswered: 2,
    totalAnswered: 10,
  },
  {
    id: 3,
    questionNumber: 3,
    question: 'What is the minimum number of bits you will need to encode the 26 letters of the alphabet?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionB(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionC(), numAnswered: 2, isCorrect: true},
               {multipleChoiceOption: i18n.answerOptionD(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionE(), numAnswered: 3, isCorrect: false},
    ],
    notAnswered: 5,
    totalAnswered: 10,
  },
  {
    id: 4,
    questionNumber: 4,
    question: 'What is a function?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionB(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionC(), numAnswered: 1, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionD(), numAnswered: 4, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionE(), numAnswered: 5, isCorrect: false},
               {multipleChoiceOption: i18n.answerOptionF(), numAnswered: 3, isCorrect: true},
               {multipleChoiceOption: i18n.answerOptionG(), numAnswered: 1, isCorrect: false},
    ],
    notAnswered: 0,
    totalAnswered: 10,
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MultipleChoiceAssessmentsOverviewTable', module)
    .addStoryTable([
      {
        name: 'Assessment multiple choice with 7 answers',
        description: 'Ability to see assessment overview for a section',
        story: () => (
            <UnconnectedMultipleChoiceAssessmentsOverviewTable
              questionAnswerData={multipleChoiceData}
              openDialog={()=>{}}
              setQuestionIndex={()=>{}}
            />
        )
      },
      {
        name: 'Assessment multiple choice with 3 answers',
        description: 'Ability to see assessment overview for a section',
        story: () => (
            <UnconnectedMultipleChoiceAssessmentsOverviewTable
              questionAnswerData={multipleChoiceData.map(question => {
                return {
                  ...question,
                  answers: question.answers.slice(0,2),
                };
              })}
              openDialog={()=>{}}
              setQuestionIndex={()=>{}}
            />
        )
      },
    ]);
};
