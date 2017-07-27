import React from 'react';
import StageExtras from './StageExtras';

export default storybook => {
  storybook
    .storiesOf('StageExtras', module)
    .addWithInfo(
      'default',
      'This is the StageExtras component.',
      () => (
        <StageExtras
          stageNumber={1}
          nextLevelPath="#"
          bonusLevels={[
            {
              id: 23222,
              name: "courseB_maze_seq_challenge1",
              type: "Maze",
              map: [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 2, 0],
                [0, 0, 1, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 1, 0],
                [0, 0, 1, 4, 4, 1, 1, 0],
                [0, 0, 1, 1, 3, 4, 1, 0],
                [0, 0, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
              ],
              skin: "birds",
              startDirection: 2,
              perfected: false,
            },
            {
              id: 23223,
              name: "courseB_maze_seq_challenge2",
              type: "Maze",
              map: [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 4, 1, 3, 0],
                [0, 1, 1, 0, 1, 1, 4, 0],
                [0, 1, 0, 1, 1, 0, 1, 0],
                [0, 1, 1, 1, 0, 1, 1, 0],
                [0, 1, 1, 0, 1, 1, 1, 0],
                [0, 2, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
              ],
              skin: "birds",
              startDirection: 2,
              perfected: true,
            },
          ]}
          showProjectWidget={false}
        />
      )
    );
};
