import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';
import {questionOne, questionTwo, questionThree} from './assessmentsTestHelpers';

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
