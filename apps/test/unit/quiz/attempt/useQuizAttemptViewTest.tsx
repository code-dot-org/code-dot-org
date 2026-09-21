import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import {QuizAttemptData} from '@cdo/apps/quiz/attempt/types';
import useQuizAttempt from '@cdo/apps/quiz/attempt/useQuizAttempt';
import useQuizAttemptView from '@cdo/apps/quiz/attempt/useQuizAttemptView';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

jest.mock('@cdo/apps/quiz/attempt/useQuizAttempt');
const mockUseQuizAttempt = jest.mocked(useQuizAttempt);

let mockScriptId: number | null = 7;
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({progress: {scriptId: mockScriptId}}),
}));

const ATTEMPT: QuizAttemptData = {
  id: 1,
  attemptNumber: 1,
  submittedAt: null,
  score: null,
  maxScore: null,
  expiresAt: null,
  canRetake: false,
};

const BASE_HOOK_STATE = {
  attempt: undefined as QuizAttemptData | null | undefined,
  isLoading: false,
  error: null as string | null,
  beginAttempt: jest.fn(),
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

function Harness(props: LabProps) {
  const {workspaceContent} = useQuizAttemptView(props);
  return <>{workspaceContent}</>;
}

function renderView({
  hookState = {},
  quizQuestions = [],
  scriptId = 7,
  allowMultipleAttempts,
}: {
  hookState?: Partial<typeof BASE_HOOK_STATE>;
  quizQuestions?: QuizQuestionSummary[];
  scriptId?: number | null;
  allowMultipleAttempts?: boolean;
} = {}) {
  mockScriptId = scriptId;
  mockUseQuizAttempt.mockReturnValue({...BASE_HOOK_STATE, ...hookState});
  return render(
    <Harness
      levelProperties={
        {
          id: 42,
          quizQuestions,
          allowMultipleAttempts,
        } as unknown as LabProps['levelProperties']
      }
    />
  );
}

describe('useQuizAttemptView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows a loading message while the initial check is in flight', () => {
    renderView({hookState: {isLoading: true}});
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows a standalone-level message when there is no unit', () => {
    renderView({scriptId: null});
    expect(
      screen.getByText('Quiz attempts are not allowed on a standalone level.')
    ).toBeInTheDocument();
  });

  it('shows a Begin Quiz button when there is no attempt yet, and starts one on click', () => {
    const beginAttempt = jest.fn();
    renderView({hookState: {attempt: null, beginAttempt}});

    fireEvent.click(screen.getByRole('button', {name: 'Begin Quiz'}));

    expect(beginAttempt).toHaveBeenCalledTimes(1);
  });

  it('shows the score and a Retake button once submitted and retakeable', () => {
    const beginAttempt = jest.fn();
    renderView({
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

  it('does not show a Retake button when the attempt cannot be retaken', () => {
    renderView({
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
    renderView({
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
    renderView({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [
        question({id: 1, stem: 'Page 1 question', page: 1}),
        question({id: 2, stem: 'Page 3 question', page: 3}),
      ],
    });

    // Two distinct pages exist (1 and 3), so the footer offers two position
    // buttons - "2" must reach the question on raw page 3, not an empty page.
    fireEvent.click(screen.getByRole('button', {name: '2'}));

    expect(screen.getByText('Page 3 question')).toBeInTheDocument();
  });

  it('omits the question label for a single-question quiz', () => {
    renderView({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question()],
    });

    expect(screen.queryByText(/Question 1 of/)).not.toBeInTheDocument();
  });

  it('labels each question with its position for a multi-question quiz', () => {
    renderView({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question({id: 1, page: 1}), question({id: 2, page: 1})],
    });

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
  });

  it('submits the chosen answer when a choice is selected', () => {
    const submitQuestionResponse = jest.fn().mockResolvedValue(undefined);
    renderView({
      hookState: {attempt: ATTEMPT, submitQuestionResponse},
      quizQuestions: [question({id: 5})],
    });

    fireEvent.click(screen.getByRole('radio', {name: /8/}));

    expect(submitQuestionResponse).toHaveBeenCalledWith(5, {
      selectedChoiceId: 'b',
    });
    expect(screen.getByRole('radio', {name: /8/})).toBeChecked();
  });

  it('advances to the next page instead of finishing when not on the last page', () => {
    const finishAttempt = jest.fn();
    renderView({
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

  it('finishes the attempt when the last-page button is clicked', () => {
    const finishAttempt = jest.fn().mockResolvedValue(undefined);
    renderView({
      hookState: {attempt: ATTEMPT, finishAttempt},
      quizQuestions: [question({id: 1, page: 1})],
    });

    fireEvent.click(screen.getByRole('button', {name: /Submit|Finish/}));

    expect(finishAttempt).toHaveBeenCalledTimes(1);
  });

  it('labels the last-page button Submit when the quiz allows only one attempt', () => {
    renderView({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question({id: 1, page: 1})],
      allowMultipleAttempts: false,
    });

    expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
  });

  it('labels the last-page button Finish when the quiz allows multiple attempts', () => {
    renderView({
      hookState: {attempt: ATTEMPT},
      quizQuestions: [question({id: 1, page: 1})],
      allowMultipleAttempts: true,
    });

    expect(screen.getByRole('button', {name: 'Finish'})).toBeInTheDocument();
  });

  it('does not render the footer outside of an in-progress attempt', () => {
    renderView({hookState: {attempt: null}});
    expect(
      screen.queryByRole('button', {name: /Next|Submit|Finish/})
    ).not.toBeInTheDocument();
  });
});
