import React from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';
import { fakeLevels } from './progressTestHelpers';

const levels = [
  {
    status: 'perfect',
    url: '/foo/bar',
  },
  {
    status: 'not_tried',
    url: '/foo/bar',
  },
  {
    status: 'attempted',
    url: '/foo/bar',
  },
  {
    status: 'passed',
    url: '/foo/bar',
  },
  {
    status: 'submitted',
    url: '/foo/bar',
  },
];

export default storybook => {
  storybook
    .storiesOf('ProgressBubbleSet', module)
    .addStoryTable([
      {
        name:'starting at 3',
        story: () => (
          <ProgressBubbleSet
            start={3}
            levels={levels}
          />
        )
      },
      {
        name:'multiple lines',
        story: () => (
          <ProgressBubbleSet
            start={1}
            levels={fakeLevels(20)}
          />
        )
      },
      {
        name:'disabled bubble set',
        description: 'should be white and not clickable',
        story: () => (
          <ProgressBubbleSet
            start={1}
            levels={levels}
            disabled={true}
          />
        )
      },
    ]);
};
