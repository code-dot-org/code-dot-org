import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuizAttemptWorkspace from '@cdo/apps/quiz/attempt/QuizAttemptWorkspace';
import {QuizAttemptData} from '@cdo/apps/quiz/attempt/types';
import useQuizAttempt from '@cdo/apps/quiz/attempt/useQuizAttempt';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

jest.mock('@cdo/apps/quiz/attempt/useQuizAttempt');
const mockUseQuizAttempt = jest.mocked(useQuizAttempt);

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
    stem: 'What is the value of x?',
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
}: {
  hookState?: Partial<typeof BASE_HOOK_STATE>;
  quizQuestions?: QuizQuestionSummary[];
  unitId?: number | null;
  allowMultipleAttempts?: boolean;
  displayName?: string;
  showIntroScreen?: boolean;
} = {}) {
  mockUseQuizAttempt.mockReturnValue({...BASE_HOOK_STATE, ...hookState});
  return render(
    <QuizAttemptWorkspace
      levelId={42}
      levelName="quiz-level-name"
      unitId={unitId ?? undefined}
      quizQuestions={quizQuestions}
      allowMultipleAttempts={allowMultipleAttempts}
      displayName={displayName}
      showIntroScreen={showIntroScreen}
    />
  );
}

describe('QuizAttemptWorkspace', () => {
  beforeEach(() => {
    // clear, not reset: beginAttempt's resolved implementation has to
    // survive, since a no-intro render calls it from the auto-begin effect.
    jest.clearAllMocks();
  });

  it('shows a loading message while the initial check is in flight', () => {
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

  it('shows a Begin Quiz button to retry when the initial check itself failed', () => {
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

    fireEvent.click(screen.getByRole('button', {name: 'Retake Quiz'}));

    expect(beginAttempt).not.toHaveBeenCalled();
    const heading = screen.getByRole('heading', {
      name: 'Unit 3 Assessment',
      level: 2,
    });
    expect(heading).toHaveFocus();

    fireEvent.click(screen.getByRole('button', {name: 'Begin'}));
    expect(beginAttempt).toHaveBeenCalledTimes(1);
  });

  it('shows the score and a Retake button once submitted and retakeable', () => {
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

    expect(screen.getByText('Submitted. Score: 2 / 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Retake Quiz'}));
    expect(beginAttempt).toHaveBeenCalledTimes(1);
  });

  it('moves focus to the Retake button once submitted, since the footer button is gone', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          canRetake: true,
        },
      },
    });

    expect(screen.getByRole('button', {name: 'Retake Quiz'})).toHaveFocus();
  });

  it('moves focus to the result message when submitted with no Retake button', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          submittedAt: '2026-01-01T00:00:00Z',
          canRetake: false,
        },
      },
    });

    expect(screen.getByText(/Submitted\. Score:/)).toHaveFocus();
  });

  it('does not show a Retake button when the attempt cannot be retaken', () => {
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
      screen.queryByRole('button', {name: 'Retake Quiz'})
    ).not.toBeInTheDocument();
  });

  it('renders only the questions on the current page', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [
        question({id: 1, stem: 'Page 1 question', page: 1}),
        question({id: 2, stem: 'Page 2 question', page: 2}),
      ],
    });

    expect(screen.getByText('Page 1 question')).toBeInTheDocument();
    expect(screen.queryByText('Page 2 question')).not.toBeInTheDocument();
  });

  it('navigates by page position, not raw page value, when pages are non-contiguous', () => {
    renderWorkspace({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [
        question({id: 1, stem: 'Page 1 question', page: 1}),
        question({id: 2, stem: 'Page 3 question', page: 3}),
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

  it('restores in-progress answers and leaves questions missing from the map blank', () => {
    renderWorkspace({
      hookState: {
        attempt: {
          ...ATTEMPT,
          questionResultsInProgress: [
            {quizQuestionId: 1, selectedChoiceId: 'b'},
          ],
        },
      },
      quizQuestions: [
        question({
          id: 1,
          stem: 'First',
          choices: [
            {id: 'a', text: 'five'},
            {id: 'b', text: 'eight'},
          ],
        }),
        question({
          id: 2,
          stem: 'Second',
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

  it('advances to the next page instead of finishing when not on the last page', () => {
    const finishAttempt = jest.fn();
    renderWorkspace({
      hookState: {attempt: ATTEMPT, finishAttempt},
      quizQuestions: [
        question({id: 1, stem: 'Page 1 question', page: 1}),
        question({id: 2, stem: 'Page 2 question', page: 2}),
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
        question({id: 1, stem: 'Page 1 question', page: 1}),
        question({id: 2, stem: 'Page 2 question', page: 2}),
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
      quizQuestions: [question({id: 1, stem: 'Page 1 question', page: 1})],
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
});
