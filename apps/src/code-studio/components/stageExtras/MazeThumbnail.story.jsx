import React from 'react';
import MazeThumbnail from './MazeThumbnail';

const sampleMap = [
  [0, 0, 0, 4, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 2, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 4],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 3, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export default storybook => {
  storybook
    .storiesOf('MazeThumbnail', module)
    .addStoryTable([{
      name: 'Angry Birds',
      description: 'This is the MazeThumbnail component.',
      story: () => (
        <MazeThumbnail
          map={sampleMap}
          skin="birds"
        />
      ),
    }, {
      name: 'Plants vs. Zombies',
      description: 'This is the MazeThumbnail component.',
      story: () => (
        <MazeThumbnail
          map={sampleMap}
          skin="pvz"
        />
      ),
    }, {
      name: 'Scrat',
      description: 'This is the MazeThumbnail component.',
      story: () => (
        <MazeThumbnail
          map={sampleMap}
          skin="scrat"
        />
      ),
    }, {
      name: 'Farmer',
      description: 'This is the MazeThumbnail component.',
      story: () => (
        <MazeThumbnail
          map={sampleMap}
          skin="farmer"
        />
      ),
    }, {
      name: 'Farmer Night',
      description: 'This is the MazeThumbnail component.',
      story: () => (
        <MazeThumbnail
          map={sampleMap}
          skin="farmer_night"
        />
      ),
    }]);
};
