import React from 'react';
import CorrectAnswerIcon from './CorrectAnswerIcon';

export default storybook => {
  storybook
    .storiesOf('SectionAssessments/CorrectAnswerIcon', module)
    .addStoryTable([
      {
        name: 'CorrectAnswerIcon',
        description: `
            A green check mark is visible and the percentage of students that
            that answer a question correctly.
        `,
        story: () => (
          <CorrectAnswerIcon
            percentValue="40%"
          />
        )
      },
    ]);
};
