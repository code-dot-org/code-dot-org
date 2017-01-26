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
            startingNumber={3}
            statuses={["perfect", "not_tried", "attempted", "passed", "submitted"]}
            urls={[
              '/foo/bar',
              '/foo/bar',
              '/foo/bar',
              '/foo/bar',
              '/foo/bar',
            ]}
          />
        )
      },
      {
        name:'multiple lines',
        story: () => (
          <ProgressBubbleSet
            startingNumber={1}
            statuses={[
              "perfect", "not_tried", "not_tried", "not_tried", "not_tried",
              "not_tried", "not_tried", "not_tried", "not_tried", "not_tried",
              "not_tried", "not_tried", "not_tried", "not_tried", "not_tried",
              "not_tried", "not_tried", "not_tried", "not_tried", "not_tried"
            ]}
            urls={arrayOfItem(20, '/foo/bar')}
          />
        )
      }
    ]);
};
