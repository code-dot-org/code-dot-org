import React from 'react';
import {Provider} from 'react-redux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';
import {LevelKind} from '@cdo/apps/util/sharedConstants';
import {
  initProgress,
  lessons,
  showTeacherInfo
} from '@cdo/apps/code-studio/progressRedux';
import {
  authorizeLockable,
  setSectionLockStatus
} from '@cdo/apps/code-studio/lessonLockRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {setHiddenLessons} from '@cdo/apps/code-studio/hiddenLessonRedux';
import teacherSections, {
  setSections,
  selectSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const lockableStage = {
  id: 123,
  levels: [1, 2, 3, 4].map(id => ({
    ids: [id],
    icon: 'fa-check-square-o',
    kind: LevelKind.assessment,
    url: '/foo/bar'
  })),
  lockable: true,
  name: 'CS Principles Pre-survey',
  position: 1
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

const nonLockableNoLessonPlan = {
  ...lockableStage,
  id: 126,
  lockable: false
};

const createStore = ({
  preload = false,
  allowHidden = true,
  teacherVerified = true
} = {}) => {
  registerReducers({teacherSections});
  const store = createStoreWithReducers();
  const stages = [
    lockableStage,
    nonLockableStage,
    lockableWithLessonPlan,
    nonLockableNoLessonPlan
  ];
  store.dispatch(
    initProgress({
      scriptName: 'csp1',
      stages
    })
  );
  if (teacherVerified) {
    store.dispatch(authorizeLockable());
  }
  store.dispatch(showTeacherInfo());
  store.dispatch(setViewType(ViewType.Teacher));
  store.dispatch(
    setHiddenLessons(
      {
        11: [lockableWithLessonPlan.id]
      },
      allowHidden
    )
  );
  if (!preload) {
    const sections = {
      '11': {
        id: 11,
        name: 'test section',
        lesson_extras: true,
        pairing_allowed: true,
        studentCount: 4,
        code: 'TQGSJR',
        providerManaged: false,
        stages: {},
        tts_autoplay_enabled: false
      }
    };
    stages.forEach(stage => {
      sections[11].stages[stage.id] = [0, 1, 2].map(id => ({
        locked: true,
        name: `student${id}`,
        readonly_answers: false
      }));
    });
    store.dispatch(setSections([sections[11]]));
    store.dispatch(setSectionLockStatus(sections));
    store.dispatch(selectSection('11'));
  }
  return store;
};

const style = {
  width: 200,
  height: 200
};

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressLessonTeacherInfo', module)
    .addStoryTable([
      {
        name: 'loading',
        story: () => {
          const store = createStore({preload: true});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                  lessonUrl="https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, lockable lesson with no lesson plan, without lesson url',
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
        name:
          'hideable allowed, lockable lesson with no lesson plan, with lesson url',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                  lessonUrl="https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, lockable lesson with lesson plan, without lesson url',
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
        name:
          'hideable allowed, lockable lesson with lesson plan, with lesson url',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[2]}
                  lessonUrl="https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name: 'non-verified teacher view for lockable lesson',
        story: () => {
          const store = createStore({teacherVerified: false});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[2]}
                  lessonUrl="https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, nonlockable lesson with lesson plan, without lesson url',
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
        name:
          'hideable allowed, nonlockable lesson with lesson plan, with lesson url',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[1]}
                  lessonUrl="https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable not allowed, nonlockable lesson with no lesson plan, without lesson url',
        description: "shouldn't render anything",
        story: () => {
          const store = createStore({allowHidden: false});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[3]}
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable not allowed, nonlockable lesson with no lesson plan, with lesson url',
        story: () => {
          const store = createStore({allowHidden: false});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[3]}
                  lessonUrl="https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true"
                />
              </div>
            </Provider>
          );
        }
      }
    ]);
};
