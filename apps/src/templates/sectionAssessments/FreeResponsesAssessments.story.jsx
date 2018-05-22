import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';
import i18n from '@cdo/locale';

const studentData = [
  {
    id: '210',
    name: 'Caley',
    studentAnswers: [
      {question: 1, response:''},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
  {
    id: '211',
    name: 'Maddie',
    studentAnswers: [
      {question: 1, response: 'In painting, you have unlimited power. You have the ability to move mountains. You can bend rivers. But when I get home, the only thing I have power over is the garbage. Maybe there is a happy little waterfall happening over here. See. We take the corner of the brush and let it play back-and-forth.'},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
  {
    id: '212',
    name: 'Erin',
    studentAnswers: [
      {question: 1, response: 'In painting, you have unlimited power. You have the ability to move mountains. You can bend rivers. But when I get home, the only thing I have power over is the garbage. Maybe there is a happy little waterfall happening over here. See. We take the corner of the brush and let it play back-and-forth.'},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
  {
    id: '213',
    name: 'Brendan',
    studentAnswers: [
      {question: 1, response: 'In painting, you have unlimited power. You have the ability to move mountains. You can bend rivers. But when I get home, the only thing I have power over is the garbage. Maybe there is a happy little waterfall happening over here. See. We take the corner of the brush and let it play back-and-forth.'},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
];

const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 40, isCorrectAnswer: true},
               {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 20, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 20, isCorrectAnswer: false},
    ],
    notAnswered: 10,
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 30, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 10, isCorrectAnswer: true},
               {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 10, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 20, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 10, isCorrectAnswer: false},
    ],
    notAnswered: 30,
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesAssessments', module)
    .addStoryTable([
      {
        name: 'Free responses for question 1',
        description: 'Student free reponse answers',
        story: () => (
            <FreeResponsesAssessments
              questionAnswerData={multipleChoiceData}
              studentAnswerData={studentData}
            />
        )
      },
      {
        name: 'Free response for question 2',
        description: 'No Student response',
        story: () => (
            <FreeResponsesAssessments
              questionAnswerData={multipleChoiceData}
              studentAnswerData={studentData}
            />
        )
      },
      {
        name: 'Long question',
        description: 'Link to see full question',
        story: () => (
            <FreeResponsesAssessments
              questionAnswerData={multipleChoiceData}
              studentAnswerData={studentData}
            />
        )
      },
      {
        name: 'Free responses for question 3',
        description: 'No Student response',
        story: () => (
            <FreeResponsesAssessments
              questionAnswerData={multipleChoiceData}
              studentAnswerData={studentData}
            />
        )
      },
    ]);

};
