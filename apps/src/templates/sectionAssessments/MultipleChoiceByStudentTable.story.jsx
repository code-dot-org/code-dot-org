import React from 'react';
import MultipleChoiceByStudentTable from './MultipleChoiceByStudentTable';
import {
  studentData,
  multipleChoiceDataForSingleStudent
} from './assessmentsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MultipleChoiceByStudentTable', module)
    .addStoryTable([
      {
        name: 'Student Overview',
        description: 'Ability to see assessment overview for a single student',
        story: () => (
          <MultipleChoiceByStudentTable
            questionAnswerData={multipleChoiceDataForSingleStudent}
            studentAnswerData={studentData}
          />
        )
      },
    ]);
};
