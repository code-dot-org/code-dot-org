import React from 'react';
import ProgressBubble from './ProgressBubble';

export default storybook => {
  storybook
    .storiesOf('ProgressBubble', module)
    .addStoryTable([
      {
        name:'perfect bubble',
        story: () => (
          <ProgressBubble
            number={3}
            status="perfect"
            url="/foo/bar"
          />
        )
      },
      {
        name:'bubble with no url',
        story: () => (
          <ProgressBubble
            number={3}
            status="perfect"
          />
        )
      },
      {
        name:'attempted bubble',
        story: () => (
          <ProgressBubble
            number={3}
            status="attempted"
            url="/foo/bar"
          />
        )
      }
    ]);
};
