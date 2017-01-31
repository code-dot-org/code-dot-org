import React from 'react';
import ProgressStageContent from './ProgressStageContent';

export default storybook => {
  storybook
    .storiesOf('ProgressStageContent', module)
    .addStoryTable([
      {
        name:'progress stage content',
        story: () => (
          <ProgressStageContent
            description={"At some point we reach a physical limit of how fast " +
              "we can send bits and if we want to send a large amount of " +
              "information faster, we have to finds ways to represent the same " +
              "information with fewer bits - we must compress the data."}
          />
        )
      }
    ]);
};
