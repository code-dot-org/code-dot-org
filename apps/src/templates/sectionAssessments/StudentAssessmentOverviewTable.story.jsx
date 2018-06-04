import React from 'react';
import StudentAssessmentOverviewTable from './StudentAssessmentOverviewTable';
import {
  studentData,
  multipleChoiceDataForSingleStudent
} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/StudentAssessmentOverviewTable', module)
    .addStoryTable([
      {
        name: 'Student Overview',
        description: 'Ability to see assessment overview for a single student',
        story: () => (
          <StudentAssessmentOverviewTable
            questionAnswerData={multipleChoiceDataForSingleStudent}
            studentAnswerData={studentData}
          />
        )
      },
    ]);
};
