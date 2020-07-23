import React from 'react';
import PercentAnsweredCell from './PercentAnsweredCell';

export default storybook => {
  storybook
    .storiesOf('SectionAssessments/PercentAnsweredCell', module)
    .addStoryTable([
      {
        name: 'Show Check Mark',
        description:
          'A green check mark is displayed when the answer is correct.',
        story: () => (
          <PercentAnsweredCell percentValue={40} isCorrectAnswer={true} />
        )
      },
      {
        name: 'Hide Check Mark',
        description: 'Check mark is hidden when the answer is wrong.',
        story: () => <PercentAnsweredCell percentValue={60} />
      }
    ]);
};
