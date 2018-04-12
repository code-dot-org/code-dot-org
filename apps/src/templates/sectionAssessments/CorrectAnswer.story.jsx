import React from 'react';
import CorrectAnswer from './CorrectAnswer';

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
