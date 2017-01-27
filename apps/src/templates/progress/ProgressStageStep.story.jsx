import React from 'react';
import ProgressStageStep from './ProgressStageStep';

export default storybook => {
  storybook
    .storiesOf('ProgressStageStep', module)
    .addStoryTable([
      {
        name:'single puzzle step',
        status: 'perfect',
        story: () => (
          <ProgressStageStep
            name="Writing Exercises"
          />
        )
      }
    ]);
};
