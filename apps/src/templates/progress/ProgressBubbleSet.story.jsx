import React from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';

/**
 * Make an array of size n where each element is theprovided item
 */
const arrayOfItem = (n, item) => {
  let contents = [];
  for (var i = 0; i < n; i++) {
    contents.push(item);
  }
  return contents;
};

export default storybook => {
  storybook
    .storiesOf('ProgressBubbleSet', module)
    .addStoryTable([
      {
        name:'starting at 3',
        story: () => (
          <ProgressBubbleSet
            start={3}
            levels={[
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
            ]}
          />
        )
      },
      {
        name:'multiple lines',
        story: () => (
          <ProgressBubbleSet
            start={1}
            levels={arrayOfItem(20, {
              status: 'not_tried',
              url: '/foo/bar'
            })}
          />
        )
      }
    ]);
};
