import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import '@testing-library/jest-dom';
import progress, {
  initProgress,
  mergeResults,
  setScriptProgress,
} from '@cdo/apps/code-studio/progressRedux';
import {TestResults} from '@cdo/apps/constants';
import lab from '@cdo/apps/lab2/lab2Redux';
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

// Mock external dependencies
jest.mock('@cdo/apps/lab2/progress/continueOrFinishLesson', () =>
  jest.fn(() => ({type: 'MOCK_CONTINUE_OR_FINISH_LESSON'}))
);

jest.mock('@cdo/apps/lab2/views/dialogs', () => ({
  DialogType: {
    GenericConfirmation: 'GenericConfirmation',
  },
  useDialogControl: jest.fn(() => ({
    showDialog: jest.fn(),
  })),
}));

jest.mock(
  '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi',
  () => ({
    logUserLevelInteraction: jest.fn(),
  })
);

jest.mock('@cdo/apps/code-studio/utils', () => ({
  queryParams: jest.fn(() => null),
}));

describe('NavigationButton', () => {
  let store: Store;

  const defaultLevelProperties: LevelProperties = {
    id: 123,
    name: 'Test Level',
    appName: 'pythonlab',
    submittable: false,
    predictSettings: undefined,
    useSecondaryFinishButton: false,
  };

  const submittableLevelProperties: LevelProperties = {
    ...defaultLevelProperties,
    submittable: true,
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
            levelNumber: 0,
            position: 0,
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
  };

  beforeEach(() => {
    stubRedux();
    registerReducers({
      progress,
      lab,
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
    // it('button says "Submit" when level is not submitted and is enabled when hasRun and hasEdited are true', () => {
    //   renderNavigationButton({
    //     levelProperties: submittableLevelProperties,
    //     hasRun: true,
    //     hasEdited: true,
    //   });
    //   const submitButton = screen.getByRole('button', {name: 'Submit'});
    //   expect(submitButton).toBeEnabled();
    // });

    it('displays "Unsubmit" text and is enabled when level has been submitted', () => {
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

      screen.getByRole('button', {name: 'Unsubmit'});
    });

    // it('is enabled when level has been submitted', () => {
    //   store.dispatch({
    //     type: 'SET_LEVEL',
    //     level: {
    //       id: 123,
    //       status: LevelStatus.submitted,
    //     },
    //   });

    //   renderNavigationButton({
    //     levelProperties: submittableLevelProperties,
    //     hasRun: false,
    //     hasEdited: false,
    //   });

    //   expect(screen.getByRole('button')).not.toBeDisabled();
    // });

    // it('is enabled when hasRun and hasEdited are true', () => {
    //   renderNavigationButton({
    //     levelProperties: submittableLevelProperties,
    //     hasRun: true,
    //     hasEdited: true,
    //   });

    //   expect(screen.getByRole('button')).not.toBeDisabled();
    // });

    // it('is disabled when hasRun is false or hasEdited is false for unsubmitted level', () => {
    //   renderNavigationButton({
    //     levelProperties: submittableLevelProperties,
    //     hasRun: false,
    //     hasEdited: true,
    //   });

    //   expect(screen.getByRole('button')).toBeDisabled();

    //   // Re-render with hasRun true but hasEdited false
    //   renderNavigationButton({
    //     levelProperties: submittableLevelProperties,
    //     hasRun: true,
    //     hasEdited: false,
    //   });

    //   expect(screen.getByRole('button')).toBeDisabled();
    // });
  });

  // describe('ContinueButton (non-submittable levels)', () => {
  //   it('displays "Continue" text when there is a next level', () => {
  //     // Mock that there is a next level
  //     store.dispatch({
  //       type: 'SET_NEXT_LEVEL_ID',
  //       nextLevelId: 456,
  //     });

  //     renderNavigationButton({
  //       hasRun: true,
  //     });

  //     expect(screen.getByText('Continue')).toBeInTheDocument();
  //     expect(screen.getByRole('button')).toHaveAttribute(
  //       'id',
  //       'instructions-continue-button'
  //     );
  //   });

  //   it('displays "Finish" text when there is no next level', () => {
  //     // Ensure no next level
  //     store.dispatch({
  //       type: 'SET_NEXT_LEVEL_ID',
  //       nextLevelId: undefined,
  //     });

  //     renderNavigationButton({
  //       hasRun: true,
  //     });

  //     expect(screen.getByText('Finish')).toBeInTheDocument();
  //   });

  //   it('is hidden when requireRun is true but hasRun is false', () => {
  //     renderNavigationButton({
  //       hasRun: false,
  //       requireRun: true,
  //     });

  //     expect(screen.queryByRole('button')).not.toBeInTheDocument();
  //   });

  //   it('is shown when requireRun is true and hasRun is true', () => {
  //     renderNavigationButton({
  //       hasRun: true,
  //       requireRun: true,
  //     });

  //     expect(screen.getByRole('button')).toBeInTheDocument();
  //   });

  //   it('is shown when requireRun is false regardless of hasRun', () => {
  //     renderNavigationButton({
  //       hasRun: false,
  //       requireRun: false,
  //     });

  //     expect(screen.getByRole('button')).toBeInTheDocument();
  //   });

  //   it('is hidden when validation conditions exist but are not satisfied', () => {
  //     store.dispatch({
  //       type: 'SET_LAB_STATE',
  //       lab: {
  //         validationState: {
  //           hasConditions: true,
  //           satisfied: false,
  //         },
  //         levelProperties: defaultLevelProperties,
  //       },
  //     });

  //     renderNavigationButton({
  //       hasRun: true,
  //     });

  //     expect(screen.queryByRole('button')).not.toBeInTheDocument();
  //   });

  //   it('is shown when validation conditions exist and are satisfied', () => {
  //     store.dispatch({
  //       type: 'SET_LAB_STATE',
  //       lab: {
  //         validationState: {
  //           hasConditions: true,
  //           satisfied: true,
  //         },
  //         levelProperties: defaultLevelProperties,
  //       },
  //     });

  //     renderNavigationButton({
  //       hasRun: true,
  //     });

  //     expect(screen.getByRole('button')).toBeInTheDocument();
  //   });
  // });
});
