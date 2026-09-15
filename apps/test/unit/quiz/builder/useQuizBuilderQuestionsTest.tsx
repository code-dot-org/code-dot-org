import {act, renderHook} from '@testing-library/react-hooks';

import useQuizBuilderQuestions from '@cdo/apps/quiz/builder/useQuizBuilderQuestions';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

const QUESTION = {
  id: 7,
  type: 'MultipleChoiceQuestion',
  questionName: 'Existing question',
  stem: 'What is 2 + 2?',
  choices: [
    {id: 'a', text: '3'},
    {id: 'b', text: '4'},
  ],
  correctChoiceId: 'b',
  explanation: null,
  standards: [],
  attachedToOtherQuizzes: false,
  usedInPublishedUnit: false,
  page: 1,
};

describe('useQuizBuilderQuestions', () => {
  let getSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    getSpy = jest.spyOn(HttpClient, 'get').mockResolvedValue({
      json: async () => ({displayName: 'A quiz', questions: [QUESTION]}),
    } as Response);
    postSpy = jest.spyOn(HttpClient, 'post');
  });

  it("loads the quiz's placed questions on mount", async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42)
    );

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(getSpy).toHaveBeenCalledWith('/levels/42/quiz_configuration');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.questions).toEqual([QUESTION]);
  });

  it('posts placeholder question params and appends the created question', async () => {
    const created = {...QUESTION, id: 99, questionName: 'New question'};
    postSpy.mockResolvedValue({json: async () => created} as Response);

    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42)
    );
    await waitForNextUpdate();

    await act(async () => {
      await result.current.createQuestion();
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/levels/42/quiz_question_placements',
      JSON.stringify({
        questionName: 'New question',
        stem: 'New question',
        choices: [
          {id: 'a', text: 'Option A'},
          {id: 'b', text: 'Option B'},
        ],
        correctChoiceId: 'a',
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(result.current.questions.map(q => q.id)).toEqual([7, 99]);
  });

  it('surfaces the server error message when a create fails', async () => {
    postSpy.mockRejectedValue(
      new NetworkError('400 Bad Request', {
        json: async () => ({error: 'a specific reason'}),
      } as Response)
    );

    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42)
    );
    await waitForNextUpdate();

    await act(async () => {
      await result.current.createQuestion();
    });

    expect(result.current.error).toBe('a specific reason');
    expect(result.current.questions.map(q => q.id)).toEqual([7]);
  });

  it('reports a generic error when the load fails', async () => {
    getSpy.mockRejectedValue(new Error('offline'));

    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42)
    );
    await waitForNextUpdate();

    expect(result.current.error).toBe('Something went wrong.');
    expect(result.current.questions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
