import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {
  sendStartedReportIfNotStarted,
  sendSuccessReportForLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {navigateToNextLevelOrFinish} from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import QuizAttemptWorkspace, {
  ANSWER_AUTOSAVE_DELAY_MS,
} from '@cdo/apps/quiz/attempt/QuizAttemptWorkspace';
import {QuizAttemptData} from '@cdo/apps/quiz/attempt/types';
import useQuizAttempt from '@cdo/apps/quiz/attempt/useQuizAttempt';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

jest.mock('@cdo/apps/quiz/attempt/useQuizAttempt');

// The real alert reads teacher-section and progress state this test has no store for.
jest.mock('@cdo/apps/lab2/views/alerts/teacherViewingStudentProject', () => ({
  __esModule: true,
  default: ({
    getAlertText,
    type,
  }: {
    getAlertText?: (studentName: string | undefined) => React.ReactElement;
    type?: string;
  }) => (
    <div role="note" data-type={type}>
      {getAlertText?.('Aisha Khan')}
    </div>
  ),
}));
const mockUseQuizAttempt = jest.mocked(useQuizAttempt);

const mockDispatch = jest.fn();
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  nextLevelId: jest.fn(),
}));
const mockNextLevelId = jest.mocked(nextLevelId);

jest.mock('@cdo/apps/lab2/progress/continueOrFinishLesson', () => ({
  navigateToNextLevelOrFinish: jest.fn(),
}));
const mockNavigateToNextLevelOrFinish = jest.mocked(
  navigateToNextLevelOrFinish
);

jest.mock('@cdo/apps/code-studio/progressRedux', () => ({
  sendSuccessReportForLevel: jest.fn((levelId, appName) => ({
    type: 'SEND_SUCCESS_REPORT_FOR_LEVEL',
    levelId,
    appName,
  })),
  sendStartedReportIfNotStarted: jest.fn(appName => ({
    type: 'SEND_STARTED_REPORT',
    appName,
  })),
}));
const mockSendSuccessReportForLevel = jest.mocked(sendSuccessReportForLevel);
const mockSendStartedReportIfNotStarted = jest.mocked(
  sendStartedReportIfNotStarted
);

const ATTEMPT: QuizAttemptData = {
  id: 1,
  attemptNumber: 1,
  submittedAt: null,
  score: null,
  maxScore: null,
  expiresAt: null,
  canRetake: false,
};

// A promise whose settlement the test controls directly, for asserting on
// state while a write is still in flight.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

const BASE_HOOK_STATE = {
  attempt: undefined as QuizAttemptData | null | undefined,
  isLoading: false,
  error: null as string | null,
  // Resolved, not just jest.fn(), since a no-intro-screen render below
  // calls this itself via the auto-begin effect.
  beginAttempt: jest.fn().mockResolvedValue(undefined),
  submitQuestionResponse: jest.fn(),
  finishAttempt: jest.fn(),
};

function question(
  overrides: Partial<QuizQuestionSummary> = {}
): QuizQuestionSummary {
  return {
    id: 1,
    type: 'MultipleChoiceQuestion',
    questionName: 'Variable reassignment',
    questionTitle: 'What is the value of x?',
    choices: [
      {id: 'a', text: '5'},
      {id: 'b', text: '8'},
    ],
    page: 1,
    ...overrides,
  };
}

function renderWorkspace({
  hookState = {},
  quizQuestions = [],
  // null (not undefined) signals "no unit" - a default parameter only
  // kicks in for undefined, so this lets callers opt out of the default.
  unitId = 7,
  allowMultipleAttempts,
  displayName = 'Unit 3 Assessment',
  showIntroScreen,
  // Defaults true so existing submitted-state tests keep exercising
  // ResultsCard - only tests for the no-correctness path opt out.
  showCorrectness = true,
  customIntroText,
  // Defaults true so existing submitted-state tests keep exercising the
  // per-question results list - only tests for the hidden-questions path
  // opt out.
  showQuestionsAfterSubmit = true,
  viewAsUserId,
}: {
  hookState?: Partial<typeof BASE_HOOK_STATE>;
  quizQuestions?: QuizQuestionSummary[];
  unitId?: number | null;
  allowMultipleAttempts?: boolean;
  displayName?: string;
  showIntroScreen?: boolean;
  showCorrectness?: boolean;
  customIntroText?: string;
  showQuestionsAfterSubmit?: boolean;
  viewAsUserId?: number;
} = {}) {
  mockUseQuizAttempt.mockReturnValue({...BASE_HOOK_STATE, ...hookState});
  return render(
    <QuizAttemptWorkspace
      levelId={42}
      appName="quiz"
      levelName="quiz-level-name"
      unitId={unitId ?? undefined}
      quizQuestions={quizQuestions}
      allowMultipleAttempts={allowMultipleAttempts}
      displayName={displayName}
      showIntroScreen={showIntroScreen}
      showCorrectness={showCorrectness}
      customIntroText={customIntroText}
      showQuestionsAfterSubmit={showQuestionsAfterSubmit}
      viewAsUserId={viewAsUserId}
    />
  );
}

describe('QuizAttemptWorkspace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Restore inert thunk substitutes because resetAllMocks removes module mock implementations.
    mockSendSuccessReportForLevel.mockImplementation(
      (levelId, appName) =>
        ({
          type: 'SEND_SUCCESS_REPORT_FOR_LEVEL',
          levelId,
          appName,
        } as unknown as ReturnType<typeof sendSuccessReportForLevel>)
    );
    mockSendStartedReportIfNotStarted.mockImplementation(
      appName =>
        ({type: 'SEND_STARTED_REPORT', appName} as unknown as ReturnType<
          typeof sendStartedReportIfNotStarted
        >)
    );
    mockNavigateToNextLevelOrFinish.mockImplementation(
      () =>
        ({type: 'NAVIGATE_TO_NEXT_LEVEL_OR_FINISH'} as unknown as ReturnType<
          typeof navigateToNextLevelOrFinish
        >)
    );
    // Not the last level unless a test says otherwise.
    mockNextLevelId.mockReturnValue(43);
    // clear, not reset: beginAttempt's resolved implementation has to
    // survive, since a no-intro render calls it from the auto-begin effect.
    jest.clearAllMocks();
  });

  it('shows a loading message while the initial check for an attempt is in flight', () => {
    renderWorkspace({hookState: {isLoading: true}});
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows a standalone-level message when there is no unit', () => {
    renderWorkspace({unitId: null});
    expect(
      screen.getByText('Quiz attempts are not allowed on a standalone level.')
    ).toBeInTheDocument();
  });

  it('starts the attempt automatically when there is no intro screen', () => {
    const beginAttempt = jest.fn().mockResolvedValue(undefined);
    renderWorkspace({hookState: {attempt: null, beginAttempt}});

    expect(beginAttempt).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', {name: 'Begin Quiz'})
    ).not.toBeInTheDocument();
  });

  it('shows a Begin Quiz button to retry when the initial check for an attempt itself failed', () => {
    // attempt stays undefined (not null) when the check fails, so the
    // auto-begin effect never fires - this button is the only way out.
    const beginAttempt = jest.fn().mockResolvedValue(undefined);
    renderWorkspace({
      hookState: {error: 'Something went wrong.', beginAttempt},
    });

    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Begin Quiz'}));
    expect(beginAttempt).toHaveBeenCalledTimes(1);
  });

  it('shows a Begin Quiz button to retry when the no-intro auto-begin itself fails', () => {
    // attempt is null, not undefined - the initial check succeeded and found
    // nothing; it's the auto-begin's own POST that failed.
    const beginAttempt = jest.fn().mockResolvedValue(undefined);
    renderWorkspace({
      hookState: {attempt: null, error: 'Something went wrong.', beginAttempt},
    });

    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Begin Quiz'})
    ).toBeInTheDocument();
  });

  it('shows the intro screen instead of Begin Quiz when the quiz has one', () => {
    const beginAttempt = jest.fn();
    renderWorkspace({
      hookState: {attempt: null, beginAttempt},
      showIntroScreen: true,
    });

    expect(
      screen.getByRole('heading', {name: 'Unit 3 Assessment', level: 2})
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Begin Quiz'})
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Begin'}));
    expect(beginAttempt).toHaveBeenCalledTimes(1);
  });

  it("titles the intro screen with the level's name when displayName is blank", () => {
    renderWorkspace({
      hookState: {attempt: null},
      showIntroScreen: true,
      displayName: '',
    });

    expect(
      screen.getByRole('heading', {name: 'quiz-level-name', level: 2})
    ).toBeInTheDocument();
  });

  it('routes Retake through the intro screen when the quiz has one', () => {
    const beginAttempt = jest.fn();
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          canRetake: true,
        },
        beginAttempt,
      },
      showIntroScreen: true,
    });

    fireEvent.click(screen.getByRole('button', {name: 'Try again'}));

    expect(beginAttempt).not.toHaveBeenCalled();
    const heading = screen.getByRole('heading', {
      name: 'Unit 3 Assessment',
      level: 2,
    });
    expect(heading).toHaveFocus();

    fireEvent.click(screen.getByRole('button', {name: 'Begin'}));
    expect(beginAttempt).toHaveBeenCalledTimes(1);
  });

  it('reports the level as started once the attempt begins, so an unsubmitted attempt still shows progress', async () => {
    const beginAttempt = jest.fn().mockResolvedValue(undefined);
    renderWorkspace({
      hookState: {attempt: null, beginAttempt},
      showIntroScreen: true,
    });

    fireEvent.click(screen.getByRole('button', {name: 'Begin'}));

    await waitFor(() =>
      expect(mockSendStartedReportIfNotStarted).toHaveBeenCalledWith('quiz')
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      mockSendStartedReportIfNotStarted.mock.results[0].value
    );
  });

  it('shows the results stats and a Try again button once submitted and retakeable', () => {
    const beginAttempt = jest.fn();
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          score: 2,
          maxScore: 3,
          canRetake: true,
        },
        beginAttempt,
      },
    });

    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('2 of 3 Correct')).toBeInTheDocument();
    // Single-attempt default (allowMultipleAttempts unset) - no remaining count to fabricate.
    expect(screen.getByText('Attempt #1')).toBeInTheDocument();
    expect(screen.getByText('0 attempts remaining')).toBeInTheDocument();
    // Next level is always available alongside Try again, not just when retakeable.
    expect(
      screen.getByRole('button', {name: /Next level/})
    ).toBeInTheDocument();
    expect(screen.getByText(/^Submitted /)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
    expect(beginAttempt).toHaveBeenCalledTimes(1);
  });

  // If a levelbuilder adds a new question to a quiz that has already been submitted by a student.
  it('omits a question from the submitted results when it has no result', () => {
    renderWorkspace({
      quizQuestions: [
        question({id: 1, questionTitle: 'What is the value of x?'}),
      ],
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          questionResults: [],
        },
      },
    });

    expect(
      screen.queryByRole('heading', {name: 'What is the value of x?'})
    ).not.toBeInTheDocument();
  });

  it('dispatches navigateToNextLevelOrFinish when Next level is clicked', async () => {
    renderWorkspace({
      hookState: {
        attempt: {...ATTEMPT, submittedAt: '2026-01-01T00:00:00Z'},
      },
    });

    fireEvent.click(screen.getByRole('button', {name: /Next level/}));

    // Waits on the (already-resolved, since nothing was submitted this
    // render) pending-report promise first.
    await waitFor(() =>
      expect(mockNavigateToNextLevelOrFinish).toHaveBeenCalled()
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      mockNavigateToNextLevelOrFinish.mock.results[0].value
    );
  });

  it('shows Finish level instead of Next level on the last level, and still finishes through the same path', async () => {
    mockNextLevelId.mockReturnValue(undefined);
    renderWorkspace({
      hookState: {
        attempt: {...ATTEMPT, submittedAt: '2026-01-01T00:00:00Z'},
      },
    });

    expect(
      screen.queryByRole('button', {name: /Next level/})
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Finish level'}));

    await waitFor(() =>
      expect(mockNavigateToNextLevelOrFinish).toHaveBeenCalled()
    );
  });

  it('waits for the finish-time success report to settle before navigating to the next level', async () => {
    const report = deferred<unknown>();
    mockDispatch.mockImplementation(action =>
      action?.type === 'SEND_SUCCESS_REPORT_FOR_LEVEL'
        ? report.promise
        : undefined
    );
    const finishAttempt = jest
      .fn()
      .mockResolvedValue({...ATTEMPT, submittedAt: '2026-01-01T00:00:00Z'});
    mockUseQuizAttempt.mockReturnValue({
      ...BASE_HOOK_STATE,
      attempt: ATTEMPT,
      finishAttempt,
    });
    const {rerender} = render(
      <QuizAttemptWorkspace
        levelId={42}
        appName="quiz"
        levelName="quiz-level-name"
        unitId={7}
        quizQuestions={[question({id: 1, page: 1})]}
        displayName="Unit 3 Assessment"
        showCorrectness
      />
    );

    fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));
    await waitFor(() =>
      expect(mockSendSuccessReportForLevel).toHaveBeenCalled()
    );

    // The real hook would have updated attempt to submitted by now.
    mockUseQuizAttempt.mockReturnValue({
      ...BASE_HOOK_STATE,
      attempt: {...ATTEMPT, submittedAt: '2026-01-01T00:00:00Z'},
    });
    rerender(
      <QuizAttemptWorkspace
        levelId={42}
        appName="quiz"
        levelName="quiz-level-name"
        unitId={7}
        quizQuestions={[question({id: 1, page: 1})]}
        displayName="Unit 3 Assessment"
        showCorrectness
      />
    );

    fireEvent.click(screen.getByRole('button', {name: /Next level/}));
    expect(mockNavigateToNextLevelOrFinish).not.toHaveBeenCalled();

    report.resolve(undefined);
    await waitFor(() =>
      expect(mockNavigateToNextLevelOrFinish).toHaveBeenCalled()
    );
  });

  it('shows an open-ended attempt count when the quiz allows multiple attempts', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          attemptNumber: 2,
          canRetake: true,
        },
      },
      allowMultipleAttempts: true,
    });

    expect(screen.getByText('Attempt #2')).toBeInTheDocument();
    expect(screen.getByText('Unlimited attempts')).toBeInTheDocument();
  });

  it('moves focus to the title once submitted, with Try again in the footer', () => {
    // The title, not a button - so the result is announced before a screen
    // reader user reaches the action buttons.
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          canRetake: true,
        },
      },
    });

    expect(
      screen.getByRole('heading', {name: 'Unit 3 Assessment', level: 2})
    ).toHaveFocus();
    expect(screen.getByRole('button', {name: 'Try again'})).not.toHaveFocus();
  });

  it('moves focus to the title once submitted, without a retake', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          canRetake: false,
        },
      },
    });

    expect(
      screen.getByRole('heading', {name: 'Unit 3 Assessment', level: 2})
    ).toHaveFocus();
  });

  it('does not show a Try again button when the attempt cannot be retaken', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          canRetake: false,
        },
      },
    });

    expect(
      screen.queryByRole('button', {name: 'Try again'})
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Next level/})
    ).toBeInTheDocument();
    expect(screen.getByText(/^Submitted /)).toBeInTheDocument();
  });

  it('shows the submitted intro shell instead of results when showCorrectness is off', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          score: 2,
          maxScore: 3,
          canRetake: false,
        },
      },
      showCorrectness: false,
    });

    expect(screen.getByText('submitted')).toBeInTheDocument();
    expect(screen.getByText(/^Submitted /)).toBeInTheDocument();
    // Nothing to reveal without correctness - no score/stats card here.
    expect(screen.queryByText('67%')).not.toBeInTheDocument();
    expect(screen.queryByText('2 of 3 Correct')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Try again'})
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Next level/})
    ).toBeInTheDocument();
  });

  it('hides per-question results when showQuestionsAfterSubmit is off, but still shows the score', () => {
    renderWorkspace({
      quizQuestions: [
        question({id: 1, questionTitle: 'What is the value of x?'}),
        question({id: 2, questionTitle: 'What is the value of y?'}),
      ],
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          score: 2,
          maxScore: 3,
          questionResults: [
            {
              quizQuestionId: 1,
              questionType: 'MultipleChoiceQuestion',
              responseData: {selectedChoiceId: 'a'},
              correct: true,
              explanation: null,
              correctChoiceId: 'a',
            },
            {
              quizQuestionId: 2,
              questionType: 'MultipleChoiceQuestion',
              responseData: {selectedChoiceId: 'b'},
              correct: false,
              explanation: null,
              correctChoiceId: 'a',
            },
          ],
        },
      },
      showQuestionsAfterSubmit: false,
    });

    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {name: 'What is the value of x?'})
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {name: 'What is the value of y?'})
    ).not.toBeInTheDocument();
  });

  it('shows the submitted intro shell even when the quiz has no intro screen', () => {
    renderWorkspace({
      hookState: {
        attempt: {...ATTEMPT, submittedAt: '2026-01-01T00:00:00Z'},
      },
      showCorrectness: false,
      showIntroScreen: false,
    });

    expect(screen.getByText('submitted')).toBeInTheDocument();
  });

  it('omits the pre-attempt intro text from the submitted intro shell', () => {
    renderWorkspace({
      hookState: {
        attempt: {...ATTEMPT, submittedAt: '2026-01-01T00:00:00Z'},
      },
      showCorrectness: false,
      customIntroText: 'Read each question carefully.',
    });

    expect(
      screen.queryByText('Read each question carefully.')
    ).not.toBeInTheDocument();
  });

  it('offers Try again on the submitted intro shell when attempts remain', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          canRetake: true,
        },
      },
      showCorrectness: false,
    });

    expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Next level/})
    ).toBeInTheDocument();
  });

  it('renders only the questions on the current page', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [
        question({id: 1, questionTitle: 'Page 1 question', page: 1}),
        question({id: 2, questionTitle: 'Page 2 question', page: 2}),
      ],
    });

    expect(screen.getByText('Page 1 question')).toBeInTheDocument();
    expect(screen.queryByText('Page 2 question')).not.toBeInTheDocument();
  });

  it('navigates by page position, not raw page value, when pages are non-contiguous', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [
        question({id: 1, questionTitle: 'Page 1 question', page: 1}),
        question({id: 2, questionTitle: 'Page 3 question', page: 3}),
      ],
    });

    // Two distinct pages exist (1 and 3), so the footer offers two position
    // buttons - "2" must reach the question on raw page 3, not an empty page.
    fireEvent.click(screen.getByRole('button', {name: 'Go to page 2'}));

    expect(screen.getByText('Page 3 question')).toBeInTheDocument();
  });

  it('omits the question label for a single-question quiz', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question()],
    });

    expect(screen.queryByText(/Question 1 of/)).not.toBeInTheDocument();
  });

  it('labels each question with its position for a multi-question quiz', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question({id: 1, page: 1}), question({id: 2, page: 1})],
    });

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
  });

  it('advances to the next page instead of finishing when not on the last page', () => {
    const finishAttempt = jest.fn();
    renderWorkspace({
      hookState: {attempt: ATTEMPT, finishAttempt},
      quizQuestions: [
        question({id: 1, questionTitle: 'Page 1 question', page: 1}),
        question({id: 2, questionTitle: 'Page 2 question', page: 2}),
      ],
    });

    fireEvent.click(screen.getByRole('button', {name: /Next/}));

    expect(finishAttempt).not.toHaveBeenCalled();
    expect(screen.getByText('Page 2 question')).toBeInTheDocument();
  });

  it('moves focus to the new page heading after Next, since nothing else indicates a page change', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [
        question({id: 1, questionTitle: 'Page 1 question', page: 1}),
        question({id: 2, questionTitle: 'Page 2 question', page: 2}),
      ],
    });

    fireEvent.click(screen.getByRole('button', {name: /Next/}));

    expect(
      screen.getByRole('heading', {name: 'Page 2 question'})
    ).toHaveFocus();
  });

  it('moves focus to the quiz title once the attempt begins without an intro screen', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [
        question({id: 1, questionTitle: 'Page 1 question', page: 1}),
      ],
    });

    // Page 1 without an intro leads with the quiz title, so that heading
    // is the first one focus can land on.
    expect(
      screen.getByRole('heading', {name: 'Unit 3 Assessment'})
    ).toHaveFocus();
  });

  it('finishes the attempt when the last-page button is clicked', async () => {
    const finishAttempt = jest.fn().mockResolvedValue(undefined);
    renderWorkspace({
      hookState: {attempt: ATTEMPT, finishAttempt},
      quizQuestions: [question({id: 1, page: 1})],
    });

    fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));

    await waitFor(() => expect(finishAttempt).toHaveBeenCalledTimes(1));
  });

  it('reports success for this level once the attempt is submitted, so the progress bubble updates even if the student has since navigated on', async () => {
    const finishAttempt = jest.fn().mockResolvedValue(undefined);
    renderWorkspace({
      hookState: {attempt: ATTEMPT, finishAttempt},
      quizQuestions: [question({id: 1, page: 1})],
    });

    fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));

    await waitFor(() =>
      expect(mockSendSuccessReportForLevel).toHaveBeenCalledWith('42', 'quiz')
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      mockSendSuccessReportForLevel.mock.results[0].value
    );
  });

  it('labels the last-page button Submit when the quiz allows only one attempt', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question({id: 1, page: 1})],
      allowMultipleAttempts: false,
    });

    expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
  });

  it('labels the last-page button Finish when the quiz allows multiple attempts', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question({id: 1, page: 1})],
      allowMultipleAttempts: true,
    });

    expect(screen.getByRole('button', {name: 'Finish'})).toBeInTheDocument();
  });

  it('waits for a pending answer write to settle before finishing the attempt', async () => {
    const pendingWrite = deferred<void>();
    const submitQuestionResponse = jest
      .fn()
      .mockReturnValue(pendingWrite.promise);
    const finishAttempt = jest.fn().mockResolvedValue(undefined);
    renderWorkspace({
      hookState: {attempt: ATTEMPT, submitQuestionResponse, finishAttempt},
      quizQuestions: [question({id: 5})],
    });

    fireEvent.click(screen.getByRole('radio', {name: /8/}));
    fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));

    // The answer write is still in flight - finishing must wait for it,
    // not race it to the server.
    expect(finishAttempt).not.toHaveBeenCalled();

    pendingWrite.resolve();
    await waitFor(() => expect(finishAttempt).toHaveBeenCalledTimes(1));
  });

  it('does not render the footer outside of an in-progress attempt', () => {
    renderWorkspace({
      hookState: {
        attempt: null,
        beginAttempt: jest.fn().mockResolvedValue(undefined),
      },
    });
    expect(
      screen.queryByRole('button', {name: /Next|Submit|Finish/})
    ).not.toBeInTheDocument();
  });

  it('shows no viewing-student alert to a student taking their own quiz', () => {
    renderWorkspace({hookState: {attempt: null}, showIntroScreen: true});
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  describe('when a teacher is viewing a student', () => {
    const SUBMITTED: QuizAttemptData = {
      ...ATTEMPT,
      submittedAt: '2026-01-01T00:00:00Z',
      score: 1,
      maxScore: 1,
      canRetake: true,
      questionResults: [
        {
          quizQuestionId: 1,
          questionType: 'MultipleChoiceQuestion',
          responseData: {selectedChoiceId: 'b'},
          correct: true,
          explanation: 'Because 3 + 5 = 8.',
          correctChoiceId: 'b',
        },
      ],
    };

    it("says the student's quiz is loading while the attempt loads", () => {
      renderWorkspace({
        hookState: {attempt: undefined, isLoading: true},
        viewAsUserId: 99,
      });

      const alert = screen.getByRole('note');
      expect(alert).toHaveTextContent("Loading Aisha Khan's quiz...");
      expect(alert).toHaveAttribute('data-type', 'info');
    });

    it('still shows the read-only alert when the attempt failed to load', () => {
      renderWorkspace({
        hookState: {attempt: undefined, isLoading: false, error: 'Oops'},
        viewAsUserId: 99,
      });

      expect(screen.getByRole('note')).toHaveTextContent(
        "You are viewing Aisha Khan's work in read only mode."
      );
    });

    it("fetches the student's attempt rather than the teacher's own", () => {
      renderWorkspace({viewAsUserId: 99});
      expect(mockUseQuizAttempt).toHaveBeenCalledWith(
        expect.objectContaining({userId: 99})
      );
    });

    it('never starts an attempt, even for a quiz with no intro screen', () => {
      const beginAttempt = jest.fn().mockResolvedValue(undefined);
      renderWorkspace({
        hookState: {attempt: null, beginAttempt},
        showIntroScreen: false,
        viewAsUserId: 99,
      });

      expect(beginAttempt).not.toHaveBeenCalled();
      const alert = screen.getByRole('note');
      expect(alert).toHaveTextContent("Aisha Khan hasn't started this level.");
      expect(alert).toHaveAttribute('data-type', 'info');
    });

    it("shows every question, unanswered and read-only, when the student hasn't started", () => {
      renderWorkspace({
        hookState: {attempt: null},
        quizQuestions: [
          question({id: 1, questionTitle: 'What is the value of x?'}),
          question({id: 2, questionTitle: 'What is the value of y?', page: 2}),
        ],
        viewAsUserId: 99,
      });

      expect(screen.getByText('What is the value of x?')).toBeInTheDocument();
      expect(screen.getByText('What is the value of y?')).toBeInTheDocument();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: /Next|Submit|Finish|Begin/})
      ).not.toBeInTheDocument();
    });

    it("shows the student's saved answers, ungraded and read-only, while in progress", () => {
      renderWorkspace({
        hookState: {
          attempt: {
            ...ATTEMPT,
            questionResultsInProgress: [
              {
                quizQuestionId: 1,
                questionType: 'MultipleChoiceQuestion',
                responseData: {selectedChoiceId: 'b'},
              },
            ],
          },
        },
        quizQuestions: [question({id: 1})],
        viewAsUserId: 99,
      });

      const alert = screen.getByRole('note');
      expect(alert).toHaveTextContent(
        'Aisha Khan is still working on this assessment.'
      );
      expect(alert).toHaveAttribute('data-type', 'warning');
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: /Next|Submit|Finish/})
      ).not.toBeInTheDocument();
    });

    it('shows score, question results, and the explanation even when the quiz hides them, without Try again', () => {
      renderWorkspace({
        hookState: {attempt: SUBMITTED},
        quizQuestions: [question({id: 1})],
        showCorrectness: false,
        showQuestionsAfterSubmit: false,
        viewAsUserId: 99,
      });

      const alert = screen.getByRole('note');
      expect(alert).toHaveTextContent(
        "You are viewing Aisha Khan's work in read only mode."
      );
      expect(alert).toHaveAttribute('data-type', 'info');
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Because 3 + 5 = 8.')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Try again'})
      ).not.toBeInTheDocument();
    });
  });

  describe('multiple choice questions', () => {
    it('restores in-progress answers and leaves questions missing from the map blank', () => {
      renderWorkspace({
        hookState: {
          attempt: {
            ...ATTEMPT,
            questionResultsInProgress: [
              {
                quizQuestionId: 1,
                questionType: 'MultipleChoiceQuestion',
                responseData: {selectedChoiceId: 'b'},
              },
            ],
          },
        },
        quizQuestions: [
          question({
            id: 1,
            questionTitle: 'First',
            choices: [
              {id: 'a', text: 'five'},
              {id: 'b', text: 'eight'},
            ],
          }),
          question({
            id: 2,
            questionTitle: 'Second',
            choices: [
              {id: 'a', text: 'left'},
              {id: 'b', text: 'right'},
            ],
          }),
        ],
      });

      expect(screen.getByRole('radio', {name: /eight/})).toBeChecked();
      expect(screen.getByRole('radio', {name: /left/})).not.toBeChecked();
      expect(screen.getByRole('radio', {name: /right/})).not.toBeChecked();
    });

    it('submits the chosen answer when a choice is selected', async () => {
      const submitQuestionResponse = jest.fn().mockResolvedValue(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [question({id: 5})],
      });

      fireEvent.click(screen.getByRole('radio', {name: /8/}));

      // The optimistic UI update is synchronous; the write itself is queued
      // onto a per-question promise chain, so it lands a tick later.
      expect(screen.getByRole('radio', {name: /8/})).toBeChecked();
      await waitFor(() =>
        expect(submitQuestionResponse).toHaveBeenCalledWith(5, {
          selectedChoiceId: 'b',
        })
      );
    });

    it('sends writes for the same question in the order they were picked', async () => {
      const firstWrite = deferred<void>();
      const submitQuestionResponse = jest
        .fn()
        .mockReturnValueOnce(firstWrite.promise)
        .mockResolvedValueOnce(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [question({id: 5})],
      });

      fireEvent.click(screen.getByRole('radio', {name: /8/})); // choice b
      fireEvent.click(screen.getByRole('radio', {name: /5/})); // choice a, right after

      // The second pick is queued behind the first write, not racing it.
      await waitFor(() =>
        expect(submitQuestionResponse).toHaveBeenCalledTimes(1)
      );
      expect(submitQuestionResponse).toHaveBeenCalledWith(5, {
        selectedChoiceId: 'b',
      });

      firstWrite.resolve();
      await waitFor(() =>
        expect(submitQuestionResponse).toHaveBeenCalledTimes(2)
      );
      expect(submitQuestionResponse).toHaveBeenLastCalledWith(5, {
        selectedChoiceId: 'a',
      });
    });

    it('rolls back the optimistic choice when its write fails and nothing newer was picked', async () => {
      const submitQuestionResponse = jest
        .fn()
        .mockRejectedValue(new Error('network down'));
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [question({id: 5})],
      });

      fireEvent.click(screen.getByRole('radio', {name: /8/}));
      expect(screen.getByRole('radio', {name: /8/})).toBeChecked();

      await waitFor(() =>
        expect(screen.getByRole('radio', {name: /8/})).not.toBeChecked()
      );
      expect(screen.getByRole('radio', {name: /5/})).not.toBeChecked();
    });

    it('does not roll back a newer choice when an earlier write for the same question fails', async () => {
      const firstWrite = deferred<void>();
      const submitQuestionResponse = jest
        .fn()
        .mockReturnValueOnce(firstWrite.promise)
        .mockResolvedValueOnce(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [question({id: 5})],
      });

      fireEvent.click(screen.getByRole('radio', {name: /8/})); // b, will fail
      fireEvent.click(screen.getByRole('radio', {name: /5/})); // a, picked after

      firstWrite.reject(new Error('network down'));
      await waitFor(() =>
        expect(submitQuestionResponse).toHaveBeenCalledTimes(2)
      );

      expect(screen.getByRole('radio', {name: /5/})).toBeChecked();
    });

    it('sends the currently selected choices when finishing', async () => {
      const finishAttempt = jest.fn().mockResolvedValue(undefined);
      const submitQuestionResponse = jest.fn().mockResolvedValue(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse, finishAttempt},
        quizQuestions: [question({id: 5, page: 1})],
      });

      fireEvent.click(screen.getByRole('radio', {name: /8/}));
      await waitFor(() => expect(submitQuestionResponse).toHaveBeenCalled());
      fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));

      await waitFor(() =>
        expect(finishAttempt).toHaveBeenCalledWith({5: {selectedChoiceId: 'b'}})
      );
    });

    it('shows a result card for each submitted multiple choice question', () => {
      renderWorkspace({
        quizQuestions: [
          question({id: 1, questionTitle: 'What is the value of x?'}),
          question({id: 2, questionTitle: 'What is the value of y?'}),
        ],
        hookState: {
          attempt: {
            ...ATTEMPT,
            submittedAt: '2026-01-01T00:00:00Z',
            questionResults: [
              {
                quizQuestionId: 1,
                questionType: 'MultipleChoiceQuestion',
                responseData: {selectedChoiceId: 'a'},
                correct: true,
                explanation: null,
                correctChoiceId: 'a',
              },
              {
                quizQuestionId: 2,
                questionType: 'MultipleChoiceQuestion',
                responseData: {selectedChoiceId: 'b'},
                correct: false,
                explanation: null,
                correctChoiceId: 'a',
              },
            ],
          },
        },
      });

      expect(
        screen.getByRole('heading', {name: 'What is the value of x?'})
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {name: 'What is the value of y?'})
      ).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    });
  });

  describe('free response questions', () => {
    const FR_QUESTION = question({
      id: 9,
      type: 'FreeResponseQuestion',
      questionTitle: 'Why does the loop stop?',
      choices: undefined,
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('restores in-progress answer text', () => {
      renderWorkspace({
        hookState: {
          attempt: {
            ...ATTEMPT,
            questionResultsInProgress: [
              {
                quizQuestionId: 9,
                questionType: 'FreeResponseQuestion',
                responseData: {answerText: 'x > 3'},
              },
            ],
          },
        },
        quizQuestions: [FR_QUESTION],
      });

      expect(screen.getByRole('textbox', {name: /loop stop/})).toHaveValue(
        'x > 3'
      );
    });

    it('autosaves the answer only once typing pauses', async () => {
      jest.useFakeTimers();
      const submitQuestionResponse = jest.fn().mockResolvedValue(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [FR_QUESTION],
      });
      const textbox = screen.getByRole('textbox', {name: /loop stop/});

      fireEvent.change(textbox, {target: {value: 'x'}});
      act(() => jest.advanceTimersByTime(ANSWER_AUTOSAVE_DELAY_MS - 1));
      fireEvent.change(textbox, {target: {value: 'x > 3'}});
      act(() => jest.advanceTimersByTime(ANSWER_AUTOSAVE_DELAY_MS - 1));
      expect(submitQuestionResponse).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(1));
      await waitFor(() =>
        expect(submitQuestionResponse).toHaveBeenCalledWith(9, {
          answerText: 'x > 3',
        })
      );
      expect(submitQuestionResponse).toHaveBeenCalledTimes(1);
    });

    it('saves the answer right away on blur', async () => {
      const submitQuestionResponse = jest.fn().mockResolvedValue(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [FR_QUESTION],
      });
      const textbox = screen.getByRole('textbox', {name: /loop stop/});

      fireEvent.change(textbox, {target: {value: 'x > 3'}});
      fireEvent.blur(textbox);

      await waitFor(() =>
        expect(submitQuestionResponse).toHaveBeenCalledWith(9, {
          answerText: 'x > 3',
        })
      );
    });

    it('does not save on blur when nothing changed', async () => {
      const submitQuestionResponse = jest.fn().mockResolvedValue(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [FR_QUESTION],
      });

      fireEvent.blur(screen.getByRole('textbox', {name: /loop stop/}));

      await Promise.resolve();
      expect(submitQuestionResponse).not.toHaveBeenCalled();
    });

    it('keeps the typed answer when its save fails', async () => {
      const submitQuestionResponse = jest
        .fn()
        .mockRejectedValue(new Error('offline'));
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse},
        quizQuestions: [FR_QUESTION],
      });
      const textbox = screen.getByRole('textbox', {name: /loop stop/});

      fireEvent.change(textbox, {target: {value: 'x > 3'}});
      fireEvent.blur(textbox);

      await waitFor(() => expect(submitQuestionResponse).toHaveBeenCalled());
      expect(textbox).toHaveValue('x > 3');
    });

    it('sends the answer text with submit and drops the pending autosave', async () => {
      jest.useFakeTimers();
      const submitQuestionResponse = jest.fn().mockResolvedValue(undefined);
      const finishAttempt = jest.fn().mockResolvedValue(undefined);
      renderWorkspace({
        hookState: {attempt: ATTEMPT, submitQuestionResponse, finishAttempt},
        quizQuestions: [question({id: 5}), FR_QUESTION],
      });

      fireEvent.click(screen.getByRole('radio', {name: /8/}));
      fireEvent.change(screen.getByRole('textbox', {name: /loop stop/}), {
        target: {value: 'x > 3'},
      });
      fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));

      await waitFor(() =>
        expect(finishAttempt).toHaveBeenCalledWith({
          5: {selectedChoiceId: 'b'},
          9: {answerText: 'x > 3'},
        })
      );
      act(() => jest.advanceTimersByTime(ANSWER_AUTOSAVE_DELAY_MS));
      expect(submitQuestionResponse).not.toHaveBeenCalledWith(9, {
        answerText: 'x > 3',
      });
    });

    it('shows the submitted answer text in the results', () => {
      renderWorkspace({
        hookState: {
          attempt: {
            ...ATTEMPT,
            submittedAt: '2026-10-14T00:00:00Z',
            questionResults: [
              {
                quizQuestionId: 9,
                questionType: 'FreeResponseQuestion',
                responseData: {answerText: 'x > 3'},
                correct: null,
                explanation: null,
                correctChoiceId: null,
              },
            ],
          },
        },
        quizQuestions: [FR_QUESTION],
      });

      expect(screen.getByText('Why does the loop stop?')).toBeInTheDocument();
      expect(screen.getByText('x > 3')).toBeInTheDocument();
    });

    it("shows a teacher the student's in-progress answer text", () => {
      renderWorkspace({
        viewAsUserId: 99,
        hookState: {
          attempt: {
            ...ATTEMPT,
            questionResultsInProgress: [
              {
                quizQuestionId: 9,
                questionType: 'FreeResponseQuestion',
                responseData: {answerText: 'x > 3'},
              },
            ],
          },
        },
        quizQuestions: [FR_QUESTION],
      });

      expect(screen.getByText("Student's answer")).toBeInTheDocument();
      expect(screen.getByText('x > 3')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });
});
