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

// Fake data generator.
// Returns an array of objects that can be used to render a group.
// Offset will creating objects starting at the offset indexed
// element in the names array above, rather than the first element (default).
const getItems = (count, offset = 0) =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    id: names[k + offset],
    name: names[k + offset]
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
