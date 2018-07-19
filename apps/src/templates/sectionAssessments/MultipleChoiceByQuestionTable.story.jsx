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
              {name: 'Matt', id: 1, answer: 'B'},
              {name: 'Kim', id: 2, answer: 'A'},
              {name: 'Megan', id: 3, answer: 'C'}
            ]}
            correctAnswer={'A'}
          />
        )
      },
    ]);

};
