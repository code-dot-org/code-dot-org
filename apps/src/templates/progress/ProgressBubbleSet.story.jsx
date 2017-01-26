import React from 'react';
import ProgressBubbleSet from './ProgressBubbleSet';

console.log('pbs');

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
          />
        )
      }
    ]);
};
