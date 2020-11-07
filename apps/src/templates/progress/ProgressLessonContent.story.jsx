import React from 'react';
import ProgressLessonContent from './ProgressLessonContent';
import {
  fakeLevels,
  fakeLevel,
  fakeProgressForLevels
} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import progress, {setProgress} from '@cdo/apps/code-studio/progressRedux';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

export default storybook => {
  const store = createStore(combineReducers({progress}));
  storybook.storiesOf('Progress/ProgressLessonContent', module).addStoryTable([
    {
      name: 'progress lesson content',
      story: () => {
        let levels = fakeLevels(5).map((level, index) => ({
          ...level,
          name: 'Progression'
        }));
        let levelProgress = fakeProgressForLevels(levels);
        levelProgress[1].status = LevelStatus.perfect;
        store.dispatch(setProgress(levelProgress));

        return (
          <Provider store={store}>
            <ProgressLessonContent
              disabled={false}
              levels={fakeLevels(5).map((level, index) => ({
                ...level,
                name: 'Progression'
              }))}
            />
          </Provider>
        );
      }
    },
    {
      name: 'with unplugged lesson',
      description: 'pill should say unplugged, because of first level',
      story: () => {
        let levels = [fakeLevel({isUnplugged: true}), ...fakeLevels(5)].map(
          level => ({...level, name: 'Progression'})
        );
        let levelProgress = fakeProgressForLevels(levels);
        store.dispatch(setProgress(levelProgress));

        return (
          <Provider store={store}>
            <ProgressLessonContent disabled={false} levels={levels} />
          </Provider>
        );
      }
    },
    {
      name: 'with named unplugged lesson',
      description:
        'First pill should say unplugged. second should say level 1-5',
      story: () => {
        let levels = [
          {
            ...fakeLevel({isUnplugged: true}),
            name: 'Fun unplugged/named level'
          },
          ...fakeLevels(5, {named: false})
        ];
        let levelProgress = fakeProgressForLevels(levels);
        store.dispatch(setProgress(levelProgress));

        return (
          <Provider store={store}>
            <ProgressLessonContent disabled={false} levels={levels} />
          </Provider>
        );
      }
    },
    {
      name: 'with no named levels',
      description: 'no pills',
      story: () => {
        let levels = [
          {
            ...fakeLevel({isUnplugged: true, name: undefined})
          },
          ...fakeLevels(5, {named: false})
        ];
        let levelProgress = fakeProgressForLevels(levels);
        store.dispatch(setProgress(levelProgress));

        return (
          <Provider store={store}>
            <ProgressLessonContent disabled={false} levels={levels} />
          </Provider>
        );
      }
    }
  ]);
};
