import React from 'react';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';
import {questionOne, questionTwo, questionThree} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesAssessmentsTable', module)
    .addStoryTable([
      {
        name: 'Free responses for question 1',
        description: 'Student free reponse answers',
        story: () => (
          <FreeResponsesAssessmentsTable
            freeResponses={questionOne}
          />
        )
      },
      {
        name: 'Free responses for question 2',
        description: 'Display table if at least one student completes assessment',
        story: () => (
          <FreeResponsesAssessmentsTable
            freeResponses={questionTwo}
          />
        )
      },
      {
        name: 'Free responses for assessments',
        description: 'Student assessment submitted without response',
        story: () => (
          <FreeResponsesAssessmentsTable
            freeResponses={questionThree}
          />
        )
      },
    ]);

};
