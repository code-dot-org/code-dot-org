import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';

const questionOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: ' ',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    response: `As trees get older they lose their chlorophyll. In painting, you have unlimited power.
        You have the ability to move mountains. You can bend rivers. But when I get home, the only thing
        I have power over is the garbage..,`
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'Go out on a limb - that is where the fruit is',
  },
  {
    id: 4,
    studentId: '213',
    name: 'Brendan',
    response: `We do not make mistakes we just have happy little accidents. Once you learn the technique,
        ohhh! Turn you loose on the world; you become a tiger.,`
  },
];

const questionTwo = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'In every walk with nature, one receives far more than one seeks',
  },
];

const questionThree = [
  {
    id: 1,
    studentId: '210',
    name: 'Maddie',
    response: ' ',
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesAssessments', module)
    .addStoryTable([
      {
        name: 'Free responses for question 1',
        description: 'Display responses of all students',
        story: () => (
          <FreeResponsesAssessments
            freeResponses={questionOne}
          />
        )
      },
      {
        name: 'Free responses for question 2',
        description: 'Display table if at least one student completes assessment',
        story: () => (
          <FreeResponsesAssessments
            freeResponses={questionTwo}
          />
        )
      },
      {
        name: 'Free responses for assessments',
        description: 'Student assessment submitted without response',
        story: () => (
          <FreeResponsesAssessments
            freeResponses={questionThree}
          />
        )
      },
    ]);

};
