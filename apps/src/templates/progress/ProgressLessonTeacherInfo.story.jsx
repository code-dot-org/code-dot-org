import React from 'react';
import {Provider} from 'react-redux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';
import {LevelKind} from '@cdo/apps/util/sharedConstants';
import {initProgress, lessons} from '@cdo/apps/code-studio/progressRedux';
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

// 0
const lockableNoPlanYesUrl = {
  id: 123,
  levels: [1, 2, 3, 4].map(id => ({
    ids: [id],
    icon: 'fa-check-square-o',
    kind: LevelKind.assessment,
    url: '/foo/bar'
  })),
  lockable: true,
  name: 'CS Principles Pre-survey',
  position: 1,
  lessonStartUrl:
    'https://studio.code.org/s/csd3-2020/lessons/5/levels/1?login_required=true'
};

// 1
const nonLockableYesPlanYesUrl = {
  ...lockableNoPlanYesUrl,
  id: 124,
  lockable: false,
  lesson_plan_html_url: 'lesson_plan.html'
};

// 2
const lockableYesPlanYesUrl = {
  ...lockableNoPlanYesUrl,
  id: 125,
  lesson_plan_html_url: 'lesson_plan.html'
};

// 3
const nonLockableNoPlanYesUrl = {
  ...lockableNoPlanYesUrl,
  id: 126,
  lockable: false
};

// 4
const lockableNoPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 124,
  lessonStartUrl: null
};

// 5
const lockableYesPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 125,
  lessonStartUrl: null,
  lesson_plan_html_url: 'lesson_plan.html'
};

// 6
const nonLockableNoPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 126,
  lockable: false,
  lessonStartUrl: null
};

// 7
const nonLockableYesPlanNoUrl = {
  ...lockableNoPlanYesUrl,
  id: 125,
  lessonStartUrl: null,
  lockable: false,
  lesson_plan_html_url: 'lesson_plan.html'
};

const createStore = ({
  preload = false,
  allowHidden = true,
  teacherVerified = true
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
    nonLockableYesPlanNoUrl
  ];
  store.dispatch(
    initProgress({
      scriptId: 17,
      scriptName: 'csp1',
      lessons: lessons
    })
  );
  store.dispatch(
    setHiddenLessons(
      {
        11: [lockableYesPlanYesUrl.id]
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
        lessons: {},
        tts_autoplay_enabled: false
      }
    };
    lessons.forEach(lesson => {
      sections[11].lessons[lesson.id] = [0, 1, 2].map(id => ({
        locked: true,
        name: `student${id}`,
        readonly_answers: false
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
  height: 200
};

export default {
  title: 'ProgressLessonTeacherInfo',
  component: ProgressLessonTeacherInfo
};

const store = createStore();
const loadingStore = createStore({preload: true});
const nonVerifiedTeacherStore = createStore({teacherVerified: false});
const hiddenStore = createStore({allowHidden: false});

const state = store.getState();
const loadingState = loadingStore.getState();
const nonVerifiedStoreState = nonVerifiedTeacherStore.getState();
const hiddenStoreState = hiddenStore.getState();

export const Loading = () => (
  <Provider store={loadingStore}>
    <div style={style}>
      <ProgressLessonTeacherInfo lesson={lessons(loadingState.progress)[0]} />
    </div>
  </Provider>
);

export const HideableLockableNoPlanNoUrl = () => (
  <Provider store={store}>
    <div style={style}>
      <ProgressLessonTeacherInfo lesson={lessons(state.progress)[4]} />
    </div>
  </Provider>
);

export const HideableLockableNoPlanYesUrl = () => (
  <Provider store={store}>
    <div style={style}>
      <ProgressLessonTeacherInfo lesson={lessons(state.progress)[0]} />
    </div>
  </Provider>
);

export const HideableLockableYesPlanNoUrl = () => (
  <Provider store={store}>
    <div style={style}>
      <ProgressLessonTeacherInfo lesson={lessons(state.progress)[5]} />
    </div>
  </Provider>
);

export const HideableLockableYesPlanYesUrl = () => (
  <Provider store={store}>
    <div style={style}>
      <ProgressLessonTeacherInfo lesson={lessons(state.progress)[2]} />
    </div>
  </Provider>
);

export const NonVerifiedLockableLesson = () => (
  <Provider store={nonVerifiedTeacherStore}>
    <div style={style}>
      <ProgressLessonTeacherInfo
        lesson={lessons(nonVerifiedStoreState.progress)[2]}
      />
    </div>
  </Provider>
);

export const HideableNonLockableYesPlanNoUrl = () => (
  <Provider store={store}>
    <div style={style}>
      <ProgressLessonTeacherInfo lesson={lessons(state.progress)[7]} />
    </div>
  </Provider>
);

export const HideableNonLockableYesPlanYesUrl = () => (
  <Provider store={store}>
    <div style={style}>
      <ProgressLessonTeacherInfo lesson={lessons(state.progress)[1]} />
    </div>
  </Provider>
);

export const nonHideableNonLockableNoPlanNoUrl = () => (
  <Provider store={hiddenStore}>
    <div style={style}>
      <ProgressLessonTeacherInfo
        lesson={lessons(hiddenStoreState.progress)[6]}
      />
    </div>
  </Provider>
);

export const nonHideableNonLockableNoPlanYesUrl = () => (
  <Provider store={hiddenStore}>
    <div style={style}>
      <ProgressLessonTeacherInfo
        lesson={lessons(hiddenStoreState.progress)[3]}
      />
    </div>
  </Provider>
);
