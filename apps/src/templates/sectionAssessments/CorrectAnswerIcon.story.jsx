import React from 'react';
import CorrectAnswerIcon from './CorrectAnswerIcon';

export default storybook => {
  storybook
    .storiesOf('SectionAssessments/CorrectAnswerIcon', module)
    .addStoryTable([
      {
        name:'CorrectAnswerIcon',
        story: () => (
          <CorrectAnswerIcon/>
        )
      },
    ]);
};
