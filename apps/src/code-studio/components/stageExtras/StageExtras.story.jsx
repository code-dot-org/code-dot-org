import React from 'react';
import StageExtras from './StageExtras';
import progress, { mergeProgress } from '@cdo/apps/code-studio/progressRedux';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { withInfo } from '@storybook/addon-info';

function configureStore() {
  const store = createStore(combineReducers({
    progress,
  }));
  store.dispatch(mergeProgress({
    6: 100,
    7: 100,
    8: 100,
  }));
  return store;
}

export default storybook => {
  const store = configureStore();
  storybook
    .storiesOf('StageExtras', module)
    .add(
      'default',
      withInfo('This is the StageExtras component.')(() =>
        <Provider store={store}>
          <StageExtras
            stageNumber={1}
            nextLevelPath="#"
            bonusLevels={[{
              stageNumber: 1,
              levels: [
                {
                  id: 23222,
                  levelId: 5,
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
                  level: {
                    startDirection: 2,
                  },
                },
                {
                  id: 23223,
                  levelId: 6,
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
                  level: {
                    startDirection: 2,
                  },
                }
              ],
            },
            {
              stageNumber: 2,
              levels: [
                {
                  id: 23224,
                  levelId: 7,
                  name: 'courseC_artist_prog_challenge1',
                  type: 'Artist',
                  solutionImageUrl: 'https://d3p74s6bwmy6t9.cloudfront.net/80cc9bbdbd9a05c1a0cf03500b4eb38c=development/2091.png',
                },{
                  id: 23225,
                  levelId: 8,
                  name: 'courseC_PlayLab_events_challenge1',
                  type: 'Studio',
                  solutionImageUrl: 'https://d3p74s6bwmy6t9.cloudfront.net/0b5d06628b7510904ee392a94065352a=development/2069.png',
                },
              ]
            },
            {
              stageNumber: 3,
              levels: [
                {
                  id: 23226,
                  levelId: 9,
                  name: 'courseC_artist_prog_challenge1',
                  type: 'Artist',
                  solutionImageUrl: 'https://d3p74s6bwmy6t9.cloudfront.net/80cc9bbdbd9a05c1a0cf03500b4eb38c=development/2091.png',
                },
                {
                  id: 23227,
                  levelId: 10,
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
                  level: {
                    startDirection: 2,
                  },
                },
                {
                  id: 23228,
                  levelId: 11,
                  name: 'courseC_PlayLab_events_challenge1',
                  type: 'Studio',
                  solutionImageUrl: 'https://d3p74s6bwmy6t9.cloudfront.net/0b5d06628b7510904ee392a94065352a=development/2069.png',
                },
              ]
            }]}
            showProjectWidget={false}
          />
        </Provider>
      )
    );
};
