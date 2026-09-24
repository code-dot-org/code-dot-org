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
  let putSpy: jest.SpyInstance;
  let deleteSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    getSpy = jest.spyOn(HttpClient, 'get').mockResolvedValue({
      json: async () => ({displayName: 'A quiz', questions: [QUESTION]}),
    } as Response);
    postSpy = jest.spyOn(HttpClient, 'post');
    putSpy = jest.spyOn(HttpClient, 'put');
    deleteSpy = jest.spyOn(HttpClient, 'delete');
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
          {id: '0', text: 'Option A'},
          {id: '1', text: 'Option B'},
        ],
        correctChoiceId: '0',
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(result.current.questions.map(q => q.id)).toEqual([7, 99]);
  });

  it('resolves with the created question id', async () => {
    const created = {...QUESTION, id: 99};
    postSpy.mockResolvedValue({json: async () => created} as Response);

    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42)
    );
    await waitForNextUpdate();

    let createdId: number | undefined;
    await act(async () => {
      createdId = await result.current.createQuestion();
    });

    expect(createdId).toBe(99);
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
    // A create can't fail because of anything about an existing question.
    expect(result.current.errorQuestionId).toBeNull();
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
    expect(result.current.errorQuestionId).toBeNull();
  });

  describe('updateQuestion', () => {
    const PAYLOAD = {
      questionName: 'Updated question',
      stem: 'What is 2 + 3?',
      choices: QUESTION.choices,
      correctChoiceId: 'b',
      explanation: null,
    };

    it('PUTs the payload and replaces the question in place on success', async () => {
      const updated = {...QUESTION, ...PAYLOAD};
      putSpy.mockResolvedValue({json: async () => updated} as Response);

      const {result, waitForNextUpdate} = renderHook(() =>
        useQuizBuilderQuestions(42)
      );
      await waitForNextUpdate();

      let updatedId;
      await act(async () => {
        updatedId = await result.current.updateQuestion(7, PAYLOAD);
      });

      expect(putSpy).toHaveBeenCalledWith(
        '/quiz_questions/7?quizLevelId=42',
        JSON.stringify(PAYLOAD),
        true,
        {'Content-Type': 'application/json'}
      );
      expect(updatedId).toBe(QUESTION.id);
      expect(result.current.questions).toEqual([updated]);
    });

    it('resolves with the new id and replaces the question by it when the server forks it', async () => {
      const forked = {...QUESTION, ...PAYLOAD, id: 123};
      putSpy.mockResolvedValue({json: async () => forked} as Response);

      const {result, waitForNextUpdate} = renderHook(() =>
        useQuizBuilderQuestions(42)
      );
      await waitForNextUpdate();

      let updatedId;
      await act(async () => {
        updatedId = await result.current.updateQuestion(7, PAYLOAD);
      });

      expect(updatedId).toBe(123);
      expect(result.current.questions.map(q => q.id)).toEqual([123]);
    });

    it('surfaces the server error message and leaves questions untouched on failure', async () => {
      putSpy.mockRejectedValue(
        new NetworkError('400 Bad Request', {
          json: async () => ({error: 'stem cannot be blank'}),
        } as Response)
      );

      const {result, waitForNextUpdate} = renderHook(() =>
        useQuizBuilderQuestions(42)
      );
      await waitForNextUpdate();

      let updatedId;
      await act(async () => {
        updatedId = await result.current.updateQuestion(7, PAYLOAD);
      });

      expect(updatedId).toBeUndefined();
      expect(result.current.error).toBe('stem cannot be blank');
      expect(result.current.questions).toEqual([QUESTION]);
      expect(result.current.errorQuestionId).toBe(7);
    });
  });

  describe('removeQuestion', () => {
    it('DELETEs the placement and drops the question from state on success', async () => {
      deleteSpy.mockResolvedValue({
        json: async () => ({destroyed: true}),
      } as Response);

      const {result, waitForNextUpdate} = renderHook(() =>
        useQuizBuilderQuestions(42)
      );
      await waitForNextUpdate();

      let succeeded = false;
      await act(async () => {
        succeeded = await result.current.removeQuestion(7);
      });

      expect(deleteSpy).toHaveBeenCalledWith(
        '/levels/42/quiz_question_placements/7',
        true
      );
      expect(succeeded).toBe(true);
      expect(result.current.questions).toEqual([]);
    });

    it('surfaces the server error message and leaves questions untouched on failure', async () => {
      deleteSpy.mockRejectedValue(
        new NetworkError('404 Not Found', {
          json: async () => ({error: 'not found'}),
        } as Response)
      );

      const {result, waitForNextUpdate} = renderHook(() =>
        useQuizBuilderQuestions(42)
      );
      await waitForNextUpdate();

      let succeeded = true;
      await act(async () => {
        succeeded = await result.current.removeQuestion(7);
      });

      expect(succeeded).toBe(false);
      expect(result.current.error).toBe('not found');
      expect(result.current.questions).toEqual([QUESTION]);
      expect(result.current.errorQuestionId).toBe(7);
    });
  });
});
