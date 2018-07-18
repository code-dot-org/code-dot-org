import React from 'react';
import SummaryText from './SummaryText';

export default storybook => {
  storybook
    .storiesOf('SectionAssessments/SummaryText', module)
    .addStoryTable([
      {
        name: 'Summary of assessments overview',
        description: 'Display total number of students that submitted the assessment.',
        story: () => (
          <SummaryText
            numStudentSubmissions={12}
            totalNumStudents={15}
          />
        )
      },
    ]);
};
