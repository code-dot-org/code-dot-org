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
            },{
              id: 23224,
              name: 'courseC_artist_prog_challenge1',
              type: 'Artist',
              perfected: true,
              solutionImageUrl: 'https://d3p74s6bwmy6t9.cloudfront.net/80cc9bbdbd9a05c1a0cf03500b4eb38c=development/2091.png',
            },{
              id: 23225,
              name: 'courseC_PlayLab_events_challenge1',
              type: 'Studio',
              perfected: true,
              solutionImageUrl: 'https://d3p74s6bwmy6t9.cloudfront.net/0b5d06628b7510904ee392a94065352a=development/2069.png',
            },
          ]}
          showProjectWidget={false}
        />
      )
    );
};
