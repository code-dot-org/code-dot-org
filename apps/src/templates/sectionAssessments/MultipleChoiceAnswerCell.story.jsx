import React from 'react';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';

export default storybook => {
  storybook
    .storiesOf('SectionAssessments/MultipleChoiceAnswerCell', module)
    .addStoryTable([
      {
        name: 'Show Check Mark',
        description: `
            A green check mark is visible when an answer is
            question correctly.
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
        description: 'Incorrect answer',
        story: () => (
          <MultipleChoiceAnswerCell
            percentValue="40%"
          />
        )
      },
    ]);
};
