import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import '@testing-library/jest-dom';
import progress, {
  initProgress,
  setCurrentLevelId,
  setScriptProgress,
} from '@cdo/apps/code-studio/progressRedux';
import lab, {setValidationState} from '@cdo/apps/lab2/lab2Redux';
import predictLevel, {
  setHasSubmittedResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import NavigationButton from '@cdo/apps/lab2/views/components/Instructions/NavigationButton';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {InitProgressPayload, UnitProgress} from '@cdo/apps/types/progressTypes';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

describe('NavigationButton', () => {
  let store: Store;

  const defaultLevelProperties: LevelProperties = {
    id: 123,
    name: 'Test Level',
    appName: 'pythonlab',
    submittable: false,
    predictSettings: undefined,
  };

  const submittableLevelProperties: LevelProperties = {
    ...defaultLevelProperties,
    submittable: true,
  };

  const predictLevelProperties: LevelProperties = {
    ...defaultLevelProperties,
    predictSettings: {
      isPredictLevel: true,
    },
  };

  const initialProgress: InitProgressPayload = {
    currentLevelId: '123',
    scriptId: 456,
    lessons: [
      {
        id: 1,
        levels: [
          {
            id: '123',
            status: LevelStatus.not_tried,
            activeId: '',
            app: '',
            bonus: false,
            display_as_unplugged: false,
            freePlay: false,
            icon: null,
            ids: ['123'],
            inactiveIds: [],
            is_concept_level: false,
            kind: '',
            levelNumber: 1,
            position: 1,
            title: 0,
            url: '',
            path: '',
            scriptLevelId: '',
            usesLab2: false,
          },
          {
            id: '234',
            status: LevelStatus.not_tried,
            activeId: '',
            app: '',
            bonus: false,
            display_as_unplugged: false,
            freePlay: false,
            icon: null,
            ids: ['234'],
            inactiveIds: [],
            is_concept_level: false,
            kind: '',
            levelNumber: 2,
            position: 2,
            title: 0,
            url: '',
            path: '',
            scriptLevelId: '',
            usesLab2: false,
          },
        ],
        assessment: false,
        description_student: '',
        description_teacher: '',
        hasLessonPlan: false,
        key: '',
        lessonEditPath: '',
        lessonNumber: undefined,
        lessonStartUrl: '',
        lesson_extras_level_url: '',
        lesson_group_display_name: '',
        lockable: false,
        name: '',
        num_script_lessons: 0,
        numberedLesson: false,
        position: 0,
        relative_position: 0,
        script_id: 0,
        script_name: '',
        title: '',
        unplugged: null,
        background: null,
      },
    ],
    deeperLearningCourse: false,
    saveAnswersBeforeNavigation: null,
    lessonGroups: null,
    scriptName: null,
    scriptDisplayName: undefined,
    unitTitle: null,
    unitDescription: undefined,
    unitStudentDescription: undefined,
    unitHasUnnumberedLessons: false,
    courseId: null,
    courseVersionId: undefined,
    isLessonExtras: false,
    peerReviewLessonInfo: null,
    isFullProgress: false,
    currentPageNumber: 0,
    courseName: null,
  };

  beforeEach(() => {
    stubRedux();
    registerReducers({
      progress,
      lab,
      predictLevel,
    });
    store = getStore();
    store.dispatch(initProgress(initialProgress));
  });

  afterEach(() => {
    restoreRedux();
    jest.clearAllMocks();
  });

  function renderNavigationButton(
    props: {
      levelProperties?: LevelProperties;
      hasRun?: boolean;
      hasEdited?: boolean;
      className?: string;
      requireRun?: boolean;
    } = {}
  ) {
    const mergedProps = {
      levelProperties: defaultLevelProperties,
      hasRun: false,
      hasEdited: false,
      requireRun: false,
      ...props,
    };

    return render(
      <Provider store={store}>
        <ThemeProvider>
          <NavigationButton {...mergedProps} />
        </ThemeProvider>
      </Provider>
    );
  }

  describe('Submit Button', () => {
    it('displays "Submit" when level is not submitted and is enabled when hasRun and hasEdited are true', () => {
      renderNavigationButton({
        levelProperties: submittableLevelProperties,
        hasRun: true,
        hasEdited: true,
      });
      const submitButton = screen.getByRole('button', {name: 'Submit'});
      expect(submitButton).toBeEnabled();
    });

    it('displays "Unsubmit" and is enabled when level has been submitted', () => {
      // Set up state for submitted level
      const submittedProgressState: InitProgressPayload = {
        ...initialProgress,
        lessons: [
          {
            ...initialProgress.lessons[0],
            levels: [
              {
                ...initialProgress.lessons[0].levels[0],
                status: LevelStatus.submitted,
              },
            ],
          },
        ],
      };
      store.dispatch(initProgress(submittedProgressState));
      const unitProgress: UnitProgress = {
        status: LevelStatus.submitted,
        lastTimestamp: undefined,
        locked: false,
        pages: null,
        paired: false,
        result: 0,
        teacherFeedbackReviewState: undefined,
        teacherFeedbackNew: false,
        timeSpent: undefined,
      };
      store.dispatch(
        setScriptProgress({
          [submittableLevelProperties.id]: unitProgress,
        })
      );

      renderNavigationButton({
        levelProperties: submittableLevelProperties,
        hasRun: true,
        hasEdited: true,
      });

      const unsubmitButton = screen.getByRole('button', {name: 'Unsubmit'});
      expect(unsubmitButton).toBeEnabled();
    });

    it('is disabled when hasRun is false or hasEdited is false for an unsubmitted level', () => {
      renderNavigationButton({
        levelProperties: submittableLevelProperties,
        hasRun: false,
        hasEdited: true,
      });

      expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
    });
  });

  describe('Continue Button', () => {
    it('displays "Continue" when there is a next level', () => {
      renderNavigationButton({
        hasRun: true,
      });
      screen.getByRole('button', {name: 'Continue'});
    });

    it('displays "Finish" when there is no next level', () => {
      store.dispatch(setCurrentLevelId('234'));
      renderNavigationButton({
        hasRun: true,
      });
      screen.getByRole('button', {name: 'Finish'});
    });

    it('is hidden when requireRun is true but hasRun is false', () => {
      renderNavigationButton({
        hasRun: false,
        requireRun: true,
      });
      expect(
        screen.queryByRole('button', {name: 'Continue'})
      ).not.toBeInTheDocument();
    });

    it('is shown when requireRun is true and hasRun is true', () => {
      renderNavigationButton({
        hasRun: true,
        requireRun: true,
      });
      screen.getByRole('button', {name: 'Continue'});
    });

    it('is shown when requireRun is false regardless of hasRun', () => {
      renderNavigationButton({
        hasRun: false,
        requireRun: false,
      });
      screen.getByRole('button', {name: 'Continue'});
    });

    it('is hidden when validation conditions exist but are not satisfied', () => {
      store.dispatch(
        setValidationState({
          hasConditions: true,
          satisfied: false,
          message: null,
          index: 0,
        })
      );
      renderNavigationButton({
        hasRun: true,
      });
      expect(
        screen.queryByRole('button', {name: 'Continue'})
      ).not.toBeInTheDocument();
    });

    it('is shown when validation conditions exist and are satisfied', () => {
      store.dispatch(
        setValidationState({
          hasConditions: true,
          satisfied: true,
          message: null,
          index: 0,
        })
      );
      renderNavigationButton({
        hasRun: true,
      });
      screen.getByRole('button', {name: 'Continue'});
    });

    it('is hidden if predict response is not submitted', () => {
      renderNavigationButton({
        hasRun: true,
        levelProperties: predictLevelProperties,
      });

      expect(
        screen.queryByRole('button', {name: 'Continue'})
      ).not.toBeInTheDocument();
    });

    it('is shown if predict response is submitted', () => {
      store.dispatch(setHasSubmittedResponse(true));
      renderNavigationButton({
        hasRun: true,
        levelProperties: predictLevelProperties,
      });

      screen.getByRole('button', {name: 'Continue'});
    });
  });
});
