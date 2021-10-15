import React from 'react';
import CodeReviewGroups from './CodeReviewGroups';

const names = [
  'Sanchit',
  'Mike',
  'Mark',
  'Molly',
  'Ben',
  'Jessie',
  'Jamila',
  'Hannah'
];

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    id: `item-${names[k + offset]}-${new Date().getTime()}`,
    content: names[k + offset]
  }));

export default storybook => {
  storybook
    .storiesOf('CodeReviewGroups/CodeReviewGroups', module)
    .addStoryTable([
      {
        name: 'Panel Showing Existing Code Review Groups',
        story: () => <CodeReviewGroups groups={[getItems(4), getItems(4, 4)]} />
      }
    ]);
};
