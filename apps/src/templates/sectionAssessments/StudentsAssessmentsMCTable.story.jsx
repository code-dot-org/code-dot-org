import React from 'react';
import StudentsAssessmentsMCTable from './StudentsAssessmentsMCTable';
import {studentOverviewData} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/StudentsAssessmentsMCTable', module)
    .addStoryTable([
      {
        name: 'Student overview',
        description: `Ability to see detailed student overview for multiple choice questions.
            The table shows how many questions each student answered correctly and a
            time stamp for when an assessment is submitted.`,
        story: () => (
          <StudentsAssessmentsMCTable
            studentOverviewData={studentOverviewData}
          />
        )
      },
    ]);
};
