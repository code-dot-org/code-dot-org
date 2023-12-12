import React from 'react';
import {Provider} from 'react-redux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';
import {LevelKind} from '@cdo/apps/util/sharedConstants';
import {initProgress} from '@cdo/apps/code-studio/progressRedux';
import {lessons} from '@cdo/apps/code-studio/progressReduxSelectors';
import {
  authorizeLockable,
  setSectionLockStatus,
} from '@cdo/apps/code-studio/lessonLockRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {setHiddenLessons} from '@cdo/apps/code-studio/hiddenLessonRedux';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

// 0
const lockableNoPlanYesUrl = {
  id: 123,
  levels: [1, 2, 3, 4].map(id => ({
    ids: [id],
    icon: 'fa-check-square-o',
    kind: LevelKind.assessment,
    url: '/foo/bar',
  })),
  lockable: true,
  name: 'CS Principles Pre-survey',
  position: 1,
  lessonStartUrl:
    'https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true',
};

// 1
const nonLockableYesPlanYesUrl = {
  ...lockableNoPlanYesUrl,
  id: 124,
  lockable: false,
  lesson_plan_html_url: 'lesson_plan.html',
};

// 2
const lockableYesPlanYesUrl = {
  ...lockableNoPlanYesUrl,
  id: 125,
  lesson_plan_html_url: 'lesson_plan.html',
};

// 3
const nonLockableNoPlanYesUrl = {
  ...lockableNoPlanYesUrl,
  id: 126,
  lockable: false,
};

// 4
const lockableNoPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 124,
  lessonStartUrl: null,
};

// 5
const lockableYesPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 125,
  lessonStartUrl: null,
  lesson_plan_html_url: 'lesson_plan.html',
};

// 6
const nonLockableNoPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 126,
  lockable: false,
  lessonStartUrl: null,
};

// 7
const nonLockableYesPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 125,
  lessonStartUrl: null,
  lockable: false,
  lesson_plan_html_url: 'lesson_plan.html',
};

const createStore = ({
  preload = false,
  allowHidden = true,
  teacherVerified = true,
} = {}) => {
  registerReducers({teacherSections});
  const store = createStoreWithReducers();
  const lessons = [
    lockableNoPlanYesUrl,
    nonLockableYesPlanYesUrl,
    lockableYesPlanYesUrl,
    nonLockableNoPlanYesUrl,
    lockableNoPlanNoUrl,
    lockableYesPlanNoUrl,
    nonLockableNoPlanNoUrl,
    nonLockableYesPlanNoUrl,
  ];
  store.dispatch(
    initProgress({
      scriptId: 17,
      scriptName: 'csp1',
      lessons: lessons,
    })
  );
  store.dispatch(
    setHiddenLessons(
      {
        11: [lockableYesPlanYesUrl.id],
      },
      allowHidden
    )
  );
  if (!preload) {
    const sections = {
      11: {
        id: 11,
        name: 'test section',
        lesson_extras: true,
        pairing_allowed: true,
        studentCount: 4,
        code: 'TQGSJR',
        providerManaged: false,
        lessons: {},
        tts_autoplay_enabled: false,
      },
    };
    lessons.forEach(lesson => {
      sections[11].lessons[lesson.id] = [0, 1, 2].map(id => ({
        locked: true,
        name: `student${id}`,
        readonly_answers: false,
      }));
    });
    store.dispatch(setSections([sections[11]]));
    store.dispatch(setSectionLockStatus(sections));
    store.dispatch(selectSection('11'));
    if (teacherVerified) {
      store.dispatch(authorizeLockable(true));
    }
    store.dispatch(setViewType(ViewType.Instructor));
  }
  return store;
};

const style = {
  width: 200,
  height: 200,
};

export default {
  title: 'ProgressLessonTeacherInfo',
  component: ProgressLessonTeacherInfo,
};

const store = createStore();
const loadingStore = createStore({preload: true});
const nonVerifiedTeacherStore = createStore({teacherVerified: false});
const hiddenStore = createStore({allowHidden: false});

const state = store.getState();
const loadingState = loadingStore.getState();
const nonVerifiedStoreState = nonVerifiedTeacherStore.getState();
const hiddenStoreState = hiddenStore.getState();

const Template = args => (
  <Provider store={args.store}>
    <div style={style}>
      <ProgressLessonTeacherInfo
        lesson={lessons(args.state.progress)[args.lessonIndex]}
      />
    </div>
  </Provider>
);

export const Loading = Template.bind({});
Loading.args = {
  store: loadingStore,
  state: loadingState,
  lessonIndex: 0,
};

export const HideableLockableNoPlanNoUrl = Template.bind({});
HideableLockableNoPlanNoUrl.args = {
  store: store,
  state: state,
  lessonIndex: 4,
};

export const HideableLockableNoPlanYesUrl = Template.bind({});
HideableLockableNoPlanYesUrl.args = {
  store: store,
  state: state,
  lessonIndex: 0,
};

export const HideableLockableYesPlanNoUrl = Template.bind({});
HideableLockableYesPlanNoUrl.args = {
  store: store,
  state: state,
  lessonIndex: 5,
};

export const HideableLockableYesPlanYesUrl = Template.bind({});
HideableLockableYesPlanYesUrl.args = {
  store: store,
  state: state,
  lessonIndex: 2,
};

export const NonVerifiedLockableLesson = Template.bind({});
NonVerifiedLockableLesson.args = {
  store: nonVerifiedTeacherStore,
  state: nonVerifiedStoreState,
  lessonIndex: 2,
};

export const HideableNonLockableYesPlanNoUrl = Template.bind({});
HideableNonLockableYesPlanNoUrl.args = {
  store: store,
  state: state,
  lessonIndex: 7,
};

export const HideableNonLockableYesPlanYesUrl = Template.bind({});
HideableNonLockableYesPlanYesUrl.args = {
  store: store,
  state: state,
  lessonIndex: 1,
};

export const HideableNonLockableNoPlanNoUrl = Template.bind({});
HideableNonLockableNoPlanNoUrl.args = {
  store: store,
  state: state,
  lessonIndex: 6,
};

export const HideableNonLockableNoPlanYesUrl = Template.bind({});
HideableNonLockableNoPlanYesUrl.args = {
  store: store,
  state: state,
  lessonIndex: 3,
};

export const nonHideableNonLockableYesPlanYesUrl = Template.bind({});
nonHideableNonLockableYesPlanYesUrl.args = {
  store: hiddenStore,
  state: hiddenStoreState,
  lessonIndex: 1,
};

export const nonHideableNonLockableNoPlanNoUrl = Template.bind({});
nonHideableNonLockableNoPlanNoUrl.args = {
  store: hiddenStore,
  state: hiddenStoreState,
  lessonIndex: 6,
};

export const nonHideableNonLockableNoPlanYesUrl = Template.bind({});
nonHideableNonLockableNoPlanYesUrl.args = {
  store: hiddenStore,
  state: hiddenStoreState,
  lessonIndex: 3,
};

export const nonHideableLockableYesPlanYesUrl = Template.bind({});
nonHideableLockableYesPlanYesUrl.args = {
  store: hiddenStore,
  state: hiddenStoreState,
  lessonIndex: 2,
};

export const nonHideableLockableNoPlanNoUrl = Template.bind({});
nonHideableLockableNoPlanNoUrl.args = {
  store: hiddenStore,
  state: hiddenStoreState,
  lessonIndex: 4,
};

export const nonHideableLockableNoPlanYesUrl = Template.bind({});
nonHideableLockableNoPlanYesUrl.args = {
  store: hiddenStore,
  state: hiddenStoreState,
  lessonIndex: 0,
};
