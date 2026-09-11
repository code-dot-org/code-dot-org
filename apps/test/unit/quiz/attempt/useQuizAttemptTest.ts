import {act, renderHook} from '@testing-library/react-hooks';

import {QuizAttemptData} from '@cdo/apps/quiz/attempt/types';
import useQuizAttempt from '@cdo/apps/quiz/attempt/useQuizAttempt';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  ...jest.requireActual('@cdo/apps/util/HttpClient'),
  default: {
    ...jest.requireActual('@cdo/apps/util/HttpClient').default,
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const get = HttpClient.get as jest.MockedFunction<typeof HttpClient.get>;
const post = HttpClient.post as jest.MockedFunction<typeof HttpClient.post>;
const put = HttpClient.put as jest.MockedFunction<typeof HttpClient.put>;

const ATTEMPT: QuizAttemptData = {
  id: 1,
  attemptNumber: 1,
  submittedAt: null,
  score: null,
  maxScore: null,
  expiresAt: null,
  canRetake: false,
};

function jsonResponse(data: unknown): Response {
  return {ok: true, json: async () => data} as Response;
}

describe('useQuizAttempt', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
  });

  it('checks for an existing attempt on mount and stores it', async () => {
    get.mockResolvedValue(jsonResponse(ATTEMPT));
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: 7})
    );

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(get).toHaveBeenCalledWith('/quiz_attempts?levelId=42&unitId=7');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempt).toEqual(ATTEMPT);
  });

  it('finds no existing attempt', async () => {
    get.mockResolvedValue(jsonResponse(null));
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: 7})
    );

    await waitForNextUpdate();

    expect(result.current.attempt).toBeNull();
  });

  it('does not check for an attempt, and is not loading, when there is no unit', () => {
    const {result} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: undefined})
    );

    expect(get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempt).toBeUndefined();
  });

  it('beginAttempt starts/resumes/retakes via POST and stores the result', async () => {
    get.mockResolvedValue(jsonResponse(null));
    post.mockResolvedValue(jsonResponse(ATTEMPT));
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: 7})
    );
    await waitForNextUpdate();

    let returned: QuizAttemptData | undefined;
    await act(async () => {
      returned = await result.current.beginAttempt();
    });

    expect(post).toHaveBeenCalledWith(
      '/quiz_attempts',
      JSON.stringify({levelId: 42, unitId: 7}),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(returned).toEqual(ATTEMPT);
    expect(result.current.attempt).toEqual(ATTEMPT);
  });

  it('beginAttempt rejects without starting a request when there is no unit', async () => {
    const {result} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: undefined})
    );

    await expect(result.current.beginAttempt()).rejects.toThrow();
    expect(post).not.toHaveBeenCalled();
  });

  it('submitResponse posts the response once there is an attempt', async () => {
    get.mockResolvedValue(jsonResponse(ATTEMPT));
    post.mockResolvedValue(jsonResponse({id: 1, gradingStatus: 'auto_graded'}));
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: 7})
    );
    await waitForNextUpdate();

    await act(async () => {
      await result.current.submitResponse(99, {selectedChoiceId: 'a'});
    });

    expect(post).toHaveBeenCalledWith(
      '/quiz_question_responses',
      JSON.stringify({
        quizAttemptId: ATTEMPT.id,
        quizQuestionId: 99,
        responseData: {selectedChoiceId: 'a'},
      }),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('submitResponse does nothing without an attempt yet', async () => {
    const {result} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: undefined})
    );

    await act(async () => {
      await result.current.submitResponse(99, {selectedChoiceId: 'a'});
    });

    expect(post).not.toHaveBeenCalled();
  });

  it('finalizeAttempt PUTs and stores the submitted attempt', async () => {
    get.mockResolvedValue(jsonResponse(ATTEMPT));
    const submitted: QuizAttemptData = {
      ...ATTEMPT,
      submittedAt: '2026-01-01T00:00:00Z',
      score: 1,
      maxScore: 1,
      questionResults: [],
    };
    put.mockResolvedValue(jsonResponse(submitted));
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: 7})
    );
    await waitForNextUpdate();

    let returned: QuizAttemptData | undefined;
    await act(async () => {
      returned = await result.current.finalizeAttempt();
    });

    expect(put).toHaveBeenCalledWith(
      `/quiz_attempts/${ATTEMPT.id}`,
      JSON.stringify({}),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(returned).toEqual(submitted);
    expect(result.current.attempt).toEqual(submitted);
  });

  it('finalizeAttempt rejects without an attempt yet', async () => {
    const {result} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: undefined})
    );

    await expect(result.current.finalizeAttempt()).rejects.toThrow();
    expect(put).not.toHaveBeenCalled();
  });

  it('surfaces the server error message when begin rejects', async () => {
    get.mockResolvedValue(jsonResponse(null));
    post.mockRejectedValue(
      new NetworkError(
        '400 Bad Request',
        new Response(JSON.stringify({error: 'quiz is closed'}), {
          status: 400,
          headers: {'Content-Type': 'application/json'},
        })
      )
    );
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: 7})
    );
    await waitForNextUpdate();

    await act(async () => {
      await expect(result.current.beginAttempt()).rejects.toThrow();
    });

    expect(result.current.error).toBe('quiz is closed');
  });

  it('surfaces a fallback error message when the initial check fails', async () => {
    get.mockRejectedValue(new Error('network down'));
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizAttempt({levelId: 42, unitId: 7})
    );

    await waitForNextUpdate();

    expect(result.current.error).toBe('Something went wrong.');
    expect(result.current.isLoading).toBe(false);
  });
});
