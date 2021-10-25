import React from 'react';
import CodeReviewGroupsManager from './CodeReviewGroupsManager';

const names = [
  'Sanchit',
  'Mike',
  'Mark',
  'Molly',
  'Ben',
  'Jessie',
  'Jamila',
  'Hannah',
  'Harry',
  'Hermione',
  'Ron',
  'Hagrid'
];

// Fake data generator.
// Returns an array of objects that can be used to render a group.
// Offset will creating objects starting at the offset indexed
// element in the names array above, rather than the first element (default).
const getMembers = (count, offset = 0) =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    followerId: k + offset,
    name: names[k + offset]
  }));

// Create two groups of four people.
// We'll also eventually pass in a group name as a top level property.
const groups = [
  {id: 1, members: getMembers(4)},
  {id: 2, members: getMembers(4, 4)}
];

const unassigned = getMembers(4, 8);

export default storybook => {
  storybook
    .storiesOf('CodeReviewGroups/CodeReviewGroupsManager', module)
    .addStoryTable([
      {
        name: 'Panel Showing Existing Code Review Groups',
        story: () => (
          <CodeReviewGroupsManager
            initialGroups={groups}
            initialUnassigned={unassigned}
          />
        )
      }
    ]);
};
