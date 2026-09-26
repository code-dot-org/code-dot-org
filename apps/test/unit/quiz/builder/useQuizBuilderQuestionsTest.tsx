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

  it('adds a placeholder question locally, with no network call', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42)
    );
    await waitForNextUpdate();

    let id: number | undefined;
    act(() => {
      id = result.current.addPendingQuestion();
    });

    expect(postSpy).not.toHaveBeenCalled();
    expect(result.current.questions.map(q => q.id)).toEqual([7, id]);
    expect(result.current.questions[1]).toMatchObject({
      questionName: 'New question',
      stem: 'New question',
      choices: [
        {id: '0', text: 'Option A'},
        {id: '1', text: 'Option B'},
      ],
      correctChoiceId: '0',
    });
  });

  it('returns a negative id, distinct from any real server id', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42)
    );
    await waitForNextUpdate();

    let firstId: number | undefined;
    let secondId: number | undefined;
    act(() => {
      firstId = result.current.addPendingQuestion();
    });
    act(() => {
      secondId = result.current.addPendingQuestion();
    });

    expect(firstId).toBeLessThan(0);
    expect(secondId).toBeLessThan(0);
    expect(secondId).not.toBe(firstId);
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

  describe('saveQuestion', () => {
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
        updatedId = await result.current.saveQuestion(7, PAYLOAD);
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
        updatedId = await result.current.saveQuestion(7, PAYLOAD);
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
        updatedId = await result.current.saveQuestion(7, PAYLOAD);
      });

      expect(updatedId).toBeUndefined();
      expect(result.current.error).toBe('stem cannot be blank');
      expect(result.current.questions).toEqual([QUESTION]);
      expect(result.current.errorQuestionId).toBe(7);
    });

    it("POSTs a pending question's first save instead of PUTing it", async () => {
      const {result, waitForNextUpdate} = renderHook(() =>
        useQuizBuilderQuestions(42)
      );
      await waitForNextUpdate();

      let pendingId: number | undefined;
      act(() => {
        pendingId = result.current.addPendingQuestion();
      });

      const created = {...QUESTION, ...PAYLOAD, id: 99};
      postSpy.mockResolvedValue({json: async () => created} as Response);

      let updatedId;
      await act(async () => {
        updatedId = await result.current.saveQuestion(pendingId!, PAYLOAD);
      });

      expect(putSpy).not.toHaveBeenCalled();
      expect(postSpy).toHaveBeenCalledWith(
        '/levels/42/quiz_question_placements',
        JSON.stringify({...PAYLOAD, page: 1}),
        true,
        {'Content-Type': 'application/json'}
      );
      expect(updatedId).toBe(99);
      expect(result.current.questions.map(q => q.id)).toEqual([7, 99]);
    });
  });

  describe('removeQuestion', () => {
    it('drops a pending question locally, with no network call', async () => {
      const {result, waitForNextUpdate} = renderHook(() =>
        useQuizBuilderQuestions(42)
      );
      await waitForNextUpdate();

      let pendingId: number | undefined;
      act(() => {
        pendingId = result.current.addPendingQuestion();
      });

      let succeeded = false;
      await act(async () => {
        succeeded = await result.current.removeQuestion(pendingId!);
      });

      expect(deleteSpy).not.toHaveBeenCalled();
      expect(succeeded).toBe(true);
      expect(result.current.questions.map(q => q.id)).toEqual([7]);
    });

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
