import React from 'react';
import SingleStudentAssessmentsMCTable from './SingleStudentAssessmentsMCTable';
import {
  studentData,
  multipleChoiceDataForSingleStudent
} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/SingleStudentAssessmentsMCTable', module)
    .addStoryTable([
      {
        name: 'Student Overview',
        description: 'Ability to see assessment overview for a single student',
        story: () => (
          <SingleStudentAssessmentsMCTable
            questionAnswerData={multipleChoiceDataForSingleStudent}
            studentAnswerData={studentData}
          />
        )
      },
    ]);
};
