import React from 'react';
import { Provider } from 'react-redux';
import { createStoreWithReducers } from '@cdo/apps/redux';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';
import { LevelKind } from '@cdo/apps/util/sharedConstants';
import { initProgress, lessons, showTeacherInfo } from '@cdo/apps/code-studio/progressRedux';
import { authorizeLockable, setViewType, ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { setSections } from '@cdo/apps/code-studio/sectionsRedux';
import { setInitialized, updateHiddenStage } from '@cdo/apps/code-studio/hiddenStageRedux';

const lockableStage = {
  id: 123,
  levels: [1,2,3,4].map(id => ({
    ids: [id],
    icon: 'fa-check-square-o',
    kind: LevelKind.assessment,
    url: '/foo/bar'
  })),
  lockable: true,
  name: 'CS Principles Pre-survey',
  position: 1,
};

const nonLockableStage = {
  ...lockableStage,
  id: 124,
  lockable: false,
  lesson_plan_html_url: 'lesson_plan.html'
};

const lockableWithLessonPlan = {
  ...lockableStage,
  id: 125,
  lesson_plan_html_url: 'lesson_plan.html'
};

const createStore = ({preload=false, allowHidden=true} = {}) => {
  const store = createStoreWithReducers();
  const stages = [
    lockableStage,
    nonLockableStage,
    lockableWithLessonPlan
  ];
  store.dispatch(initProgress({
    scriptName: 'csp1',
    stages
  }));
  store.dispatch(authorizeLockable());
  store.dispatch(showTeacherInfo());
  store.dispatch(setViewType(ViewType.Teacher));
  store.dispatch(updateHiddenStage('11', lockableWithLessonPlan.id, true));
  store.dispatch(setInitialized(allowHidden));
  if (!preload) {
    const sections = {
      '11': {
        section_id: 11,
        section_name: 'test_section',
        stages: {}
      }
    };
    stages.forEach(stage => {
      sections[11].stages[stage.id] = [0,1,2].map(id => ({
        locked: true,
        name: `student${id}`,
        readonly_answers: false
      }));
    });
    store.dispatch(setSections(sections));
  }
  return store;
};

const style= {
  width: 200,
  height: 200
};

export default storybook => {
  storybook
    .storiesOf('ProgressLessonTeacherInfo', module)
    .addStoryTable([
      {
        name:'loading',
        story: () => {
          const store = createStore({ preload: true });
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:'hideable allowed, lockable lesson with no lesson plan',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                />
              </div>
            </Provider>
          );
        }
      },

      {
        name:'hideable allowed, lockable lesson with lesson plan',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[2]}
                />
              </div>
            </Provider>
          );
        }
      },

      {
        name:'hideable allowed, nonlockable lesson with lesson plan',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[1]}
                />
              </div>
            </Provider>
          );
        }
      },

      {
        name:'hideable not allowed, nonlockable lesson with no lesson plan',
        description: 'shouldnt render anything',
        story: () => {
          const store = createStore({allowHidden: false});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[1]}
                />
              </div>
            </Provider>
          );
        }
      },
    ]);
};
