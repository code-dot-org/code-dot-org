import React from 'react';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

export default storybook => {
  storybook
    .storiesOf('SectionAssessments/MultipleChoiceAnswerCell', module)
    .addStoryTable([
      {
        name: 'Show Check Mark',
        description: `
            A green check mark is displayed when the answer is correct.
        `,
        story: () => (
          <MultipleChoiceAnswerCell
            percentValue="40%"
            isCorrectAnswer={true}
          />
        )
      },
      {
        name:'Hide Check Mark',
        description: 'Check mark is hidden when the answer is wrong.',
        story: () => (
          <MultipleChoiceAnswerCell
            percentValue="40%"
          />
        )
      },
    ]);
};
