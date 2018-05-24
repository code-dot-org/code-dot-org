import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';
import i18n from '@cdo/locale';

const studentData = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    studentAnswers: [
      {question: 1, response:''},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    studentAnswers: [
      {question: 1, response: 'In painting, you have unlimited power. You have the ability to move mountains. You can bend rivers.'},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    studentAnswers: [
      {question: 1, response: ''},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
  {
    id: 4,
    studentId: '213',
    name: 'Brendan',
    studentAnswers: [
      {question: 1, response: 'In painting, you have unlimited power. You have the ability to move mountains. You can bend rivers.'},
      {question: 2, response: 'You want your tree to have some character. Make it special. Now we will take the almighty fan brush. Learn when to stop. Poor old tree.'},
    ],
  },
];

const questionData = [
  {
    id: 1,
    question: 1,
    questionText: 'Sound of Music',
  },
  {
    id: 2,
    question: 2,
    questionText: 'My Fair Lady',
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
            questionData={questionData}
            studentAnswerData={studentData}
          />
        )
      },
      // {
      //   name: 'Free response for question 2',
      //   description: 'No Student response',
      //   story: () => (
      //     <FreeResponsesAssessments
      //       questionAnswerData={multipleChoiceData}
      //       studentAnswerData={studentData}
      //     />
      //   )
      // },
      // {
      //   name: 'Long question',
      //   description: 'Link to see full question',
      //   story: () => (
      //       <FreeResponsesAssessments
      //         questionAnswerData={multipleChoiceData}
      //         studentAnswerData={studentData}
      //       />
      //   )
      // },
      // {
      //   name: 'Free responses for question 3',
      //   description: 'No Student response',
      //   story: () => (
      //       <FreeResponsesAssessments
      //         questionData={questionData}
      //         studentAnswerData={studentData}
      //       />
      //   )
      // },
    ]);

};
