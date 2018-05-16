import React from 'react';
import StudentAssessmentOverviewTable from './StudentAssessmentOverviewTable';
import commonMsg from '@cdo/locale';
import { studentData, multipleChoiceData } from './sectionAssessmentsHelpers';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/StudentAssessmentOverviewTable', module)
    .addStoryTable([
      {
        name: 'Student Overview.',
        description: 'Ability to see assessment overview for a single student',
        story: () => (
            <StudentAssessmentOverviewTable
              questionAnswerData={multipleChoiceData}
              studentAnswerData={studentData}
            />
        )
      },
    ]);
};
