import React from 'react';
import LessonExtras from './LessonExtras';
import progress, {mergeResults} from '@cdo/apps/code-studio/progressRedux';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import {withInfo} from '@storybook/addon-info';

function configureStore() {
  const store = createStore(
    combineReducers({
      progress
    })
  );
  store.dispatch(
    mergeResults({
      6: 100,
      7: 100,
      8: 100
    })
  );
  return store;
}

export default storybook => {
  const store = configureStore();
  storybook.storiesOf('LessonExtras', module).add(
    'default',
    withInfo('This is the LessonExtras component.')(() => (
      <Provider store={store}>
        <LessonExtras
          lessonNumber={1}
          nextLevelPath="#"
          bonusLevels={[
            {
              stageNumber: 1,
              levels: [
                {
                  id: '23222',
                  display_name: 'courseB_maze_seq_challenge1',
                  url:
                    'http://studio.code.org:3000/s/coursef-2019/lessons/1/extras?level_name=courseC_artist_prog_challenge1',
                  perfect: false,
                  type: 'Maze',
                  maze_summary: {
                    map: [
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 1, 1, 1, 1, 2, 0],
                      [0, 0, 1, 1, 1, 1, 1, 0],
                      [0, 0, 1, 1, 1, 1, 1, 0],
                      [0, 0, 1, 4, 4, 1, 1, 0],
                      [0, 0, 1, 1, 3, 4, 1, 0],
                      [0, 0, 1, 1, 1, 1, 1, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0]
                    ],
                    skin: 'birds',
                    level: {
                      startDirection: 2
                    }
                  }
                },
                {
                  id: '23223',
                  display_name: 'courseB_maze_seq_challenge1',
                  url:
                    'http://studio.code.org:3000/s/coursef-2019/lessons/1/extras?level_name=courseC_artist_prog_challenge1',
                  perfect: false,
                  type: 'Maze',
                  maze_summary: {
                    map: [
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 1, 1, 1, 4, 1, 3, 0],
                      [0, 1, 1, 0, 1, 1, 4, 0],
                      [0, 1, 0, 1, 1, 0, 1, 0],
                      [0, 1, 1, 1, 0, 1, 1, 0],
                      [0, 1, 1, 0, 1, 1, 1, 0],
                      [0, 2, 1, 1, 1, 1, 1, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0]
                    ],
                    skin: 'birds',
                    level: {
                      startDirection: 2
                    }
                  }
                }
              ]
            },
            {
              stageNumber: 2,
              levels: [
                {
                  id: '23224',
                  display_name: 'courseC_artist_prog_challenge1',
                  url:
                    'http://studio.code.org:3000/s/coursef-2019/lessons/1/extras?level_name=courseC_artist_prog_challenge1',
                  type: 'Artist',
                  thumbnail_url:
                    'https://d3p74s6bwmy6t9.cloudfront.net/80cc9bbdbd9a05c1a0cf03500b4eb38c=development/2091.png',
                  perfect: false
                },
                {
                  id: '23225',
                  display_name: 'courseC_PlayLab_events_challenge1',
                  url:
                    'http://studio.code.org:3000/s/coursef-2019/lessons/1/extras?level_name=courseC_artist_prog_challenge1',
                  type: 'Studio',
                  thumbnail_url:
                    'https://d3p74s6bwmy6t9.cloudfront.net/0b5d06628b7510904ee392a94065352a=development/2069.png',
                  perfect: false
                }
              ]
            },
            {
              stageNumber: 3,
              levels: [
                {
                  id: '23226',
                  display_name: 'courseC_artist_prog_challenge1',
                  url:
                    'http://studio.code.org:3000/s/coursef-2019/lessons/1/extras?level_name=courseC_artist_prog_challenge1',
                  type: 'Artist',
                  thumbnail_url:
                    'https://d3p74s6bwmy6t9.cloudfront.net/80cc9bbdbd9a05c1a0cf03500b4eb38c=development/2091.png',
                  perfect: false
                },
                {
                  id: '23227',
                  display_name: 'courseB_maze_seq_challenge2',
                  url:
                    'http://studio.code.org:3000/s/coursef-2019/lessons/1/extras?level_name=courseC_artist_prog_challenge1',
                  type: 'Maze',
                  perfect: false,
                  maze_summary: {
                    map: [
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 1, 1, 1, 4, 1, 3, 0],
                      [0, 1, 1, 0, 1, 1, 4, 0],
                      [0, 1, 0, 1, 1, 0, 1, 0],
                      [0, 1, 1, 1, 0, 1, 1, 0],
                      [0, 1, 1, 0, 1, 1, 1, 0],
                      [0, 2, 1, 1, 1, 1, 1, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0]
                    ],
                    skin: 'birds',
                    level: {
                      startDirection: 2
                    }
                  }
                },
                {
                  id: '23228',
                  display_name: 'courseC_PlayLab_events_challenge1',
                  url:
                    'http://studio.code.org:3000/s/coursef-2019/lessons/1/extras?level_name=courseC_artist_prog_challenge1',
                  type: 'Studio',
                  thumbnail_url:
                    'https://d3p74s6bwmy6t9.cloudfront.net/0b5d06628b7510904ee392a94065352a=development/2069.png',
                  perfect: false
                }
              ]
            }
          ]}
          showProjectWidget={false}
        />
      </Provider>
    ))
  );
};
