import React from 'react';
import CorrectAnswer from './CorrectAnswer';

// Leave a comment
export default storybook => {
  storybook
    .storiesOf('SectionAssessments/CorrectAnswer', module)
    .addStoryTable([
      {
        name:'CorrectAnswer',
        story: () => (
          <CorrectAnswer />
        )
      },
    ]);
};
