import React from 'react';
import SingleStudentAssessmentMCTable from './SingleStudentAssessmentMCTable';
import {
  studentData,
  multipleChoiceDataForSingleStudent
} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/SingleStudentAssessmentMCTable', module)
    .addStoryTable([
      {
        name: 'Student Overview',
        description: 'Ability to see assessment overview for a single student',
        story: () => (
          <SingleStudentAssessmentMCTable
            questionAnswerData={multipleChoiceDataForSingleStudent}
            studentAnswerData={studentData}
          />
        )
      },
    ]);
};
