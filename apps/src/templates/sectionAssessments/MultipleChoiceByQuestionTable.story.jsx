import React from 'react';
import MultipleChoiceByQuestionTable from './MultipleChoiceByQuestionTable';

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MultipleChoiceByQuestionTable', module)
    .addStoryTable([
      {
        name: 'Multiple choice responses for a question',
        description: 'This table is rendered in the detail view for a particular question.',
        story: () => (
          <MultipleChoiceByQuestionTable
            studentAnswers={[
              {name: 'Matt', answer: 'B'},
              {name: 'Kim', answer: 'A'},
              {name: 'Megan', answer: 'C'}
            ]}
            correctAnswer={'A'}
          />
        )
      },
    ]);

};
