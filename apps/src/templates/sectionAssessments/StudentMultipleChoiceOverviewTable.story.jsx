import React from 'react';
import StudentMultipleChoiceOverviewTable from './StudentMultipleChoiceOverviewTable';
import {studentOverviewData} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/StudentMultipleChoiceOverviewTable', module)
    .addStoryTable([
      {
        name: 'Student overview',
        description: 'Display assessment summary for each student',
        story: () => (
          <StudentMultipleChoiceOverviewTable
            studentOverviewData={studentOverviewData}
          />
        )
      },
    ]);
};
