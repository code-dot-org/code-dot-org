import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';
import i18n from '@cdo/locale';

const studentData = [
  {
    id: '210',
    name: 'Caley',
    studentAnswers: [
      {question: 1, response:''},
      {question: 2, response: ''},
      {question: 3, response: ''}
    ],
  },
  {
    id: '211',
    name: 'Maddie',
    answers: [
      {question: 1, response: 'In painting, you have unlimited power. You have the ability to move mountains. You can bend rivers. But when I get home, the only thing I have power over is the garbage. Maybe there is a happy little waterfall happening over here. See. We take the corner of the brush and let it play back-and-forth.'},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
      {question: 3, response: 'There is not a thing in the world wrong with washing your brush.'}
    ],
  }
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
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 50, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 15, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20, isCorrectAnswer: true},
               {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 5, isCorrectAnswer: false},
               {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
    ],
    notAnswered: 5,
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesAssessments', module)
    .addStoryTable([
      {
        name: 'Free responses for assessments',
        description: 'Student free reponse answers',
        story: () => (
            <FreeResponsesAssessments
              questionAnswerData={multipleChoiceData}
              studentAnswerData={studentData}
            />
        )
      },
    ]);
};
