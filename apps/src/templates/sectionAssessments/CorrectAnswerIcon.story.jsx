import React from 'react';
import CorrectAnswerIcon from './CorrectAnswerIcon';

export default storybook => {
  storybook
    .storiesOf('SectionAssessments/CorrectAnswerIcon', module)
    .addStoryTable([
      {
        name: 'CorrectAnswerIcon',
        description: `
            A green check mark is visible if students answer a question
            correctly.
        `,
        story: () => (
          <CorrectAnswerIcon
            percentValue="40%"
          />
        )
      },
    ]);
};
