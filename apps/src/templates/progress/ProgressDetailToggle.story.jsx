import React from 'react';
import ProgressDetailToggle from './ProgressDetailToggle';

export default storybook => {
  storybook
    .storiesOf('ProgressDetailToggle', module)
    .addStoryTable([
      {
        name:'isSummary is true',
        story: () => (
          <ProgressDetailToggle
            isSummary={true}
          />
        )
      },
      {
        name:'isSummary is false',
        story: () => (
          <ProgressDetailToggle
            isSummary={false}
          />
        )
      }
    ]);
};
