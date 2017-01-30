import React from 'react';
import ProgressStage from './ProgressStage';

export default storybook => {
  storybook
    .storiesOf('ProgressStage', module)
    .addStoryTable([
      {
        name:'progress stage',
        story: () => (
          <ProgressStage/>
        )
      }
    ]);
};
