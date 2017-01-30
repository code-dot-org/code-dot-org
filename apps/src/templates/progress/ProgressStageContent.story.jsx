import React from 'react';
import ProgressStageContent from './ProgressStageContent';

export default storybook => {
  storybook
    .storiesOf('ProgressStageContent', module)
    .addStoryTable([
      {
        name:'progress stage content',
        story: () => (
          <ProgressStageContent/>
        )
      }
    ]);
};
