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
} from '@cdo/apps/code-studio/stageLockRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {setHiddenStages} from '@cdo/apps/code-studio/hiddenStageRedux';
import teacherSections, {
  setSections,
  selectSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {setUserProviders} from '@cdo/apps/templates/currentUserRedux';
import {
  OAuthSectionTypes,
  OAuthProviders
} from '@cdo/apps/lib/ui/accounts/constants';

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
  showGoogleButton = false
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
  store.dispatch(authorizeLockable());
  store.dispatch(showTeacherInfo());
  store.dispatch(setViewType(ViewType.Teacher));
  store.dispatch(
    setHiddenStages(
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
        name: 'non-google section',
        lesson_extras: true,
        pairing_allowed: true,
        studentCount: 4,
        code: 'TQGSJR',
        providerManaged: false,
        stages: {}
      },
      '12': {
        id: 12,
        name: 'google section',
        lesson_extras: true,
        pairing_allowed: true,
        studentCount: 4,
        code: 'G-149414657094',
        providerManaged: true,
        login_type: OAuthSectionTypes.google_classroom,
        stages: {}
      }
    };
    stages.forEach(stage => {
      sections[11].stages[stage.id] = [0, 1, 2].map(id => ({
        locked: true,
        name: `student${id}`,
        readonly_answers: false
      }));
      sections[12].stages[stage.id] = [0, 1, 2].map(id => ({
        locked: true,
        name: `student${id}`,
        readonly_answers: false
      }));
    });
    store.dispatch(setSections([sections[11], sections[12]]));
    store.dispatch(setSectionLockStatus(sections));
    const providers = showGoogleButton ? [OAuthProviders.google] : ['email'];
    store.dispatch(setUserProviders(providers));
    const section = showGoogleButton ? '12' : '11';
    store.dispatch(selectSection(section));
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
        name: 'loading (with google, without google)',
        story: () => {
          const store = createStore({preload: true});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, lockable lesson with no lesson plan, without google',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, lockable lesson with no lesson plan, with google',
        description:
          'google share button requires google section and google oath',
        story: () => {
          const store = createStore({showGoogleButton: true});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[0]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, lockable lesson with lesson plan, without google',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[2]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name: 'hideable allowed, lockable lesson with lesson plan, with google',
        description:
          'google share button requires google section and google oath',
        story: () => {
          const store = createStore({showGoogleButton: true});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[2]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, nonlockable lesson with lesson plan, without google',
        story: () => {
          const store = createStore();
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[1]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable allowed, nonlockable lesson with lesson plan, with google',
        description:
          'google share button requires google section and google oath',
        story: () => {
          const store = createStore({showGoogleButton: true});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[1]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable not allowed, nonlockable lesson with no lesson plan, without google',
        description: "shouldn't render anything",
        story: () => {
          const store = createStore({allowHidden: false});
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[3]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      },
      {
        name:
          'hideable not allowed, nonlockable lesson with no lesson plan, with google',
        description:
          'google share button requires google section and google oath',
        story: () => {
          const store = createStore({
            allowHidden: false,
            showGoogleButton: true
          });
          const state = store.getState();
          return (
            <Provider store={store}>
              <div style={style}>
                <ProgressLessonTeacherInfo
                  lesson={lessons(state.progress)[3]}
                  levelUrl="code.org"
                />
              </div>
            </Provider>
          );
        }
      }
    ]);
};
