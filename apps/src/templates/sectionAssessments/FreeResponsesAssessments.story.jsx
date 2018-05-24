import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';

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
