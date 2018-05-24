import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';
import i18n from '@cdo/locale';

// const questionOne = [
//   {
//     id: 1,
//     studentId: '210',
//     name: 'Caley',
//     studentAnswers: [
//       {question: 1, response:''}, {question: 2, response: 'You want your tree.'},],
//   },
//   {
//     id: 2,
//     studentId: '211',
//     name: 'Maddie',
//     studentAnswers: [
//       {question: 1, response: 'testA.'}, {question: 2, response: ''},],
//   },
//   {
//     id: 3,
//     studentId: '212',
//     name: 'Erin',
//     studentAnswers: [{question: 1, response: 'test B'}, {question: 2, response: ''},],
//   },
//   {
//     id: 4,
//     studentId: '213',
//     name: 'Brendan',
//     studentAnswers: [{question: 1, response: 'testC.'}, {question: 2, response: ''},],
//   },
// ];

const questionOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: '',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    response: 'testA.',
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'test B',
  },
  {
    id: 4,
    studentId: '213',
    name: 'Brendan',
    response: 'testC.',
  },
];

const questionTwo = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'testA',
  },
];


// const questionData = [
//   {
//     id: 1,
//     question: 1,
//     questionText: 'Sound of Music',
//   },
//   {
//     id: 2,
//     question: 2,
//     questionText: 'My Fair Lady',
//   },
// ];


export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesAssessments', module)
    .addStoryTable([
      {
        name: 'Free responses for question 1',
        description: 'Student free reponse answers',
        story: () => (
          <FreeResponsesAssessments
            freeResponses={questionOne}
          />
        )
      },
      {
        name: 'Free response for question 2',
        description: 'Show assessment if at least one student completes assessment',
        story: () => (
          <FreeResponsesAssessments
            // questionAnswerData={multipleChoiceData}
            freeResponses={questionTwo}
          />
        )
      },
      {
        name: 'Free response for assessments',
        description: 'No Student responses',
        story: () => (
            <FreeResponsesAssessments
              // questionAnswerData={multipleChoiceData}
              freeResponses={[]}
            />
        )
      },
    ]);

};
