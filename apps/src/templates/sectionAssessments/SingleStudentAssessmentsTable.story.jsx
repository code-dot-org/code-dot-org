import React from 'react';
import SingleStudentAssessmentsTable from './SingleStudentAssessmentsTable';
import {
  studentData,
  multipleChoiceDataForSingleStudent
} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/SingleStudentAssessmentsTable', module)
    .addStoryTable([
      {
        name: 'Student Overview',
        description: 'Ability to see assessment overview for a single student',
        story: () => (
          <SingleStudentAssessmentsTable
            questionAnswerData={multipleChoiceDataForSingleStudent}
            studentAnswerData={studentData}
          />
        )
      },
    ]);
};
