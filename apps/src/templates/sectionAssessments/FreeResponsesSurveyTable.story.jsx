import React from 'react';
import FreeResponsesSurveyTable from './FreeResponsesSurveyTable';
import {surveyOne, surveyTwo} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesSurveyTable', module)
    .addStoryTable([
      {
        name: 'Free responses for survey 1',
        description: 'Display anonymous responses',
        story: () => (
          <FreeResponsesSurveyTable
            freeResponses={surveyOne}
          />
        )
      },
      {
        name: 'Free responses for survey 2',
        description: 'Table not displayed if less than 5 surveys are submitted',
        story: () => (
          <FreeResponsesSurveyTable
            freeResponses={surveyTwo}
          />
        )
      },
    ]);

};
