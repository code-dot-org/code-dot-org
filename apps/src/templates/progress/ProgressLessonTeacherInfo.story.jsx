import React from 'react';
import { Provider } from 'react-redux';
import { createStoreWithReducers } from '@cdo/apps/redux';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';
import { LevelKind } from '@cdo/apps/util/sharedConstants';
import { initProgress, lessons, levelsByLesson, showTeacherInfo } from '@cdo/apps/code-studio/progressRedux';
import { authorizeLockable, setViewType, ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { setSections } from '@cdo/apps/code-studio/sectionsRedux';
import { setInitialized } from '@cdo/apps/code-studio/hiddenStageRedux';

const lockableStage = {
  id: 123,
  levels: [1,2,3,4].map(id => ({
    ids: [id],
    icon: 'fa-list-ol',
    kind: LevelKind.assessment,
    url: '/foo/bar'
  })),
  lockable: true,
  name: 'CS Principles Pre-survey',
  position: 1,
};

const createStore = (id, {preload=false, allowHidden=true} = {}) => {
  const store = createStoreWithReducers();
  store.dispatch(initProgress({
    scriptName: 'csp1',
    stages: [
      lockableStage
    ]
  }));
  store.dispatch(authorizeLockable());
  store.dispatch(showTeacherInfo());
  store.dispatch(setViewType(ViewType.Teacher));
  store.dispatch(setInitialized(allowHidden));
  if (!preload) {
    console.log('setSections', id);
    store.dispatch(setSections({
      '11': {
        section_id: 11,
        section_name: 'test_section',
        stages: {
          [lockableStage.id]: [0,1,2].map(id => ({
            locked: true,
            name: `student${id}`,
            readonly_answers: false
          }))
        }
      }
    }));
  }
  return store;
};

export default storybook => {
  storybook
    .storiesOf('ProgressLessonTeacherInfo', module)
    .addStoryTable([
      {
        name:'loading',
        story: () => {
          const store = createStore(1, { preload: true });
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={{width: 200, height: 200}}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                  lessonNumber={1}
                  levels={levelsByLesson(state.progress)[0]}
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:'visible, lockable lesson with no lesson plan',
        story: () => {
          const store = createStore(2);
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={{width: 200, height: 200}}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                  lessonNumber={1}
                  levels={levelsByLesson(state.progress)[0]}
                />
              </div>
            </Provider>
          );
        }
      },
    ]);
};
