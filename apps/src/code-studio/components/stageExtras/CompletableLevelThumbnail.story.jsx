import React from 'react';
import CompletableLevelThumbnail from './CompletableLevelThumbnail';
import MazeThumbnail from './MazeThumbnail';

const sampleMap = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 2, 1, 1, 1, 0, 0],
  [0, 0, 0, 4, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 1, 4, 0],
  [0, 0, 0, 1, 0, 1, 0, 0],
  [0, 3, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export default storybook => {
  storybook
    .storiesOf('CompletableLevelThumbnail', module)
    .addStoryTable([{
      name: 'Angry Birds',
      description: 'This is the CompletableLevelThumbnail component.',
      story: () => (
        <CompletableLevelThumbnail width={200}>
          <MazeThumbnail
            map={sampleMap}
            startDirection={1}
            skin="birds"
          />
        </CompletableLevelThumbnail>
      ),
    }]);
};
