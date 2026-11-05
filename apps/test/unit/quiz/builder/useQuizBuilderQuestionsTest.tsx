import {act, renderHook} from '@testing-library/react-hooks';

import useQuizBuilderQuestions from '@cdo/apps/quiz/builder/useQuizBuilderQuestions';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

const QUESTION = {
  id: 7,
  type: 'MultipleChoiceQuestion',
  questionName: 'Existing question',
  questionTitle: 'What is 2 + 2?',
  choices: [
    {id: 'a', text: '3'},
    {id: 'b', text: '4'},
  ],
  correctChoiceId: 'b',
  description: null,
  explanation: null,
  standards: [],
  attachedToOtherQuizzes: false,
  deletable: true,
  usedInPublishedUnit: false,
  page: 1,
};

const PAYLOAD = {
  type: 'MultipleChoiceQuestion' as const,
  questionName: 'Updated question',
  questionTitle: 'What is 2 + 3?',
  choices: QUESTION.choices,
  correctChoiceId: 'b',
  description: null,
  explanation: null,
};

describe('useQuizBuilderQuestions', () => {
  let getSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;
  let putSpy: jest.SpyInstance;
  let version: {current: number | null};

  beforeEach(() => {
    jest.resetAllMocks();
    version = {current: null};
    getSpy = jest.spyOn(HttpClient, 'get').mockResolvedValue({
      json: async () => ({
        displayName: 'A quiz',
        version: 5,
        questions: [QUESTION],
      }),
    } as Response);
    postSpy = jest.spyOn(HttpClient, 'post');
    putSpy = jest.spyOn(HttpClient, 'put');
  });

  const renderLoaded = async () => {
    const hook = renderHook(() => useQuizBuilderQuestions(42, version));
    await hook.waitForNextUpdate();
    return hook;
  };

  it("loads the quiz's placed questions on mount", async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42, version)
    );

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(getSpy).toHaveBeenCalledWith('/levels/42/quiz_configuration');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.questions).toEqual([QUESTION]);
    expect(result.current.pages).toEqual([{page: 1, questions: [QUESTION]}]);
    expect(result.current.hasUnsavedLayout).toBe(false);
    expect(version.current).toBe(5);
  });

  it('keeps each question the same object across unrelated updates', async () => {
    const {result} = await renderLoaded();
    const before = result.current.pages[0].questions[0];

    act(() => {
      result.current.addPage();
    });

    expect(result.current.pages[0].questions[0]).toBe(before);
  });

  it('keeps a saved question the same object across unrelated updates', async () => {
    const {result} = await renderLoaded();
    // The question endpoints don't know the quiz, so they return no page.
    putSpy.mockResolvedValue({
      json: async () => ({...QUESTION, questionName: 'Renamed', page: null}),
    } as Response);
    await act(async () => {
      await result.current.saveQuestion(7, PAYLOAD);
    });
    const saved = result.current.pages[0].questions[0];
    expect(saved).toMatchObject({questionName: 'Renamed', page: 1});

    act(() => {
      result.current.addPage();
    });

    expect(result.current.pages[0].questions[0]).toBe(saved);
  });

  it('adds an empty page at the end', async () => {
    const {result} = await renderLoaded();

    act(() => {
      result.current.addPage();
    });

    expect(result.current.pages.map(p => p.questions.length)).toEqual([1, 0]);
  });

  it('adds a placeholder question locally, with no network call', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42, version)
    );
    await waitForNextUpdate();

    let id: number | undefined;
    act(() => {
      id = result.current.addPendingQuestion(1, 'MultipleChoiceQuestion');
    });

    expect(postSpy).not.toHaveBeenCalled();
    expect(result.current.questions.map(q => q.id)).toEqual([7, id]);
    expect(result.current.questions[1]).toMatchObject({
      questionName: 'New question',
      questionTitle: 'New question',
      choices: [
        {id: '0', text: 'Option A'},
        {id: '1', text: 'Option B'},
      ],
      correctChoiceId: '0',
      page: 1,
    });
  });

  it('adds a multiple select placeholder with the first option correct', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42, version)
    );
    await waitForNextUpdate();

    act(() => {
      result.current.addPendingQuestion(1, 'MultipleSelectQuestion');
    });

    expect(result.current.questions[1]).toMatchObject({
      type: 'MultipleSelectQuestion',
      choices: [
        {id: '0', text: 'Option A'},
        {id: '1', text: 'Option B'},
      ],
      correctChoiceIds: ['0'],
    });
  });

  it('adds a match placeholder with two pairs, each id random and distinct', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42, version)
    );
    await waitForNextUpdate();

    act(() => {
      result.current.addPendingQuestion(1, 'MatchQuestion');
      result.current.addPendingQuestion(1, 'MatchQuestion');
    });

    const [first, second] = result.current.questions.slice(1);
    expect(first).toMatchObject({
      type: 'MatchQuestion',
      pairs: [
        {items: [{text: 'Term A'}, {text: 'Definition A'}]},
        {items: [{text: 'Term B'}, {text: 'Definition B'}]},
      ],
    });
    const ids = [first, second].flatMap(question =>
      question.type === 'MatchQuestion'
        ? question.pairs.flatMap(pair => [
            pair.id,
            ...pair.items.map(item => item.id),
          ])
        : []
    );
    expect(ids).toHaveLength(12);
    expect(new Set(ids).size).toBe(12);
  });

  it('adds the placeholder to the given page', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42, version)
    );
    await waitForNextUpdate();

    act(() => {
      result.current.addPendingQuestion(2, 'MultipleChoiceQuestion');
    });

    expect(result.current.questions[1]).toMatchObject({page: 2});
  });

  it('returns a negative id, distinct from any real server id', async () => {
    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42, version)
    );
    await waitForNextUpdate();

    let id: number | undefined;
    act(() => {
      id = result.current.addPendingQuestion(1, 'MultipleChoiceQuestion');
    });

    expect(id).toBeLessThan(0);
  });

  it('reports a generic error when the load fails', async () => {
    getSpy.mockRejectedValue(new Error('offline'));

    const {result, waitForNextUpdate} = renderHook(() =>
      useQuizBuilderQuestions(42, version)
    );
    await waitForNextUpdate();

    expect(result.current.error).toBe('Something went wrong.');
    expect(result.current.questions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorQuestionId).toBeNull();
  });

  describe('saveQuestion', () => {
    it('PUTs the payload and replaces the question in place on success', async () => {
      const updated = {...QUESTION, ...PAYLOAD};
      putSpy.mockResolvedValue({json: async () => updated} as Response);
      const {result} = await renderLoaded();

      let updatedId;
      await act(async () => {
        updatedId = await result.current.saveQuestion(7, PAYLOAD);
      });

      expect(putSpy).toHaveBeenCalledWith(
        '/quiz_questions/7',
        JSON.stringify(PAYLOAD),
        true,
        {'Content-Type': 'application/json'}
      );
      expect(updatedId).toBe(QUESTION.id);
      expect(result.current.questions).toEqual([updated]);
      expect(result.current.hasUnsavedLayout).toBe(false);
    });

    it("keeps the load's attachedToOtherQuizzes, deletable and page, which the response can't know", async () => {
      putSpy.mockResolvedValue({
        json: async () => ({
          ...QUESTION,
          ...PAYLOAD,
          attachedToOtherQuizzes: true,
          deletable: false,
          page: null,
        }),
      } as Response);
      const {result} = await renderLoaded();

      await act(async () => {
        await result.current.saveQuestion(7, PAYLOAD);
      });

      expect(result.current.questions[0]).toMatchObject({
        attachedToOtherQuizzes: false,
        deletable: true,
        page: 1,
      });
    });

    it("puts a fork in the original's place, removing the original from the quiz on Save quiz", async () => {
      putSpy.mockResolvedValue({
        json: async () => ({...QUESTION, ...PAYLOAD, id: 123}),
      } as Response);
      const {result} = await renderLoaded();

      let updatedId;
      await act(async () => {
        updatedId = await result.current.saveQuestion(7, PAYLOAD);
      });

      expect(updatedId).toBe(123);
      expect(result.current.questions.map(q => q.id)).toEqual([123]);
      expect(result.current.hasUnsavedLayout).toBe(true);
    });

    it('deletes the original of a type change on Save quiz', async () => {
      const {correctChoiceId, ...rest} = PAYLOAD;
      void correctChoiceId;
      const switched = {
        ...rest,
        type: 'MultipleSelectQuestion' as const,
        correctChoiceIds: ['b'],
      };
      putSpy.mockResolvedValueOnce({
        json: async () => ({...QUESTION, ...switched, id: 123}),
      } as Response);
      const {result} = await renderLoaded();

      await act(async () => {
        await result.current.saveQuestion(7, switched);
      });
      putSpy.mockResolvedValueOnce({
        json: async () => ({
          version: 6,
          placements: [{quizQuestionId: 123, page: 1, position: 1}],
        }),
      } as Response);
      await act(async () => {
        await result.current.saveQuiz();
      });

      expect(JSON.parse(putSpy.mock.calls[1][1] as string)).toMatchObject({
        deleteQuestionIds: [7],
      });
    });

    it('surfaces the server error message and leaves questions untouched on failure', async () => {
      putSpy.mockRejectedValue(
        new NetworkError('400 Bad Request', {
          json: async () => ({error: 'question title cannot be blank'}),
        } as Response)
      );
      const {result} = await renderLoaded();

      let updatedId;
      await act(async () => {
        updatedId = await result.current.saveQuestion(7, PAYLOAD);
      });

      expect(updatedId).toBeUndefined();
      expect(result.current.error).toBe('question title cannot be blank');
      expect(result.current.questions).toEqual([QUESTION]);
      expect(result.current.errorQuestionId).toBe(7);
    });

    it("POSTs a pending question's first save to /quiz_questions, keeping it on its page", async () => {
      const {result} = await renderLoaded();
      let pendingId: number | undefined;
      act(() => {
        pendingId = result.current.addPendingQuestion(
          2,
          'MultipleChoiceQuestion'
        );
      });
      postSpy.mockResolvedValue({
        json: async () => ({...QUESTION, ...PAYLOAD, id: 99, page: null}),
      } as Response);

      let updatedId;
      await act(async () => {
        updatedId = await result.current.saveQuestion(pendingId!, PAYLOAD);
      });

      expect(putSpy).not.toHaveBeenCalled();
      expect(postSpy).toHaveBeenCalledWith(
        '/quiz_questions',
        JSON.stringify(PAYLOAD),
        true,
        {'Content-Type': 'application/json'}
      );
      expect(updatedId).toBe(99);
      expect(result.current.pages.map(p => p.questions.map(q => q.id))).toEqual(
        [[7], [99]]
      );
      expect(result.current.hasUnsavedLayout).toBe(true);
    });

    it('creates a pending question as the type it was switched to before its first save', async () => {
      const {result} = await renderLoaded();
      let pendingId: number | undefined;
      act(() => {
        pendingId = result.current.addPendingQuestion(
          1,
          'MultipleChoiceQuestion'
        );
      });

      const {correctChoiceId, ...rest} = PAYLOAD;
      void correctChoiceId;
      const switched = {
        ...rest,
        type: 'MultipleSelectQuestion' as const,
        correctChoiceIds: ['a', 'b'],
      };
      postSpy.mockResolvedValue({
        json: async () => ({...QUESTION, ...switched, id: 99}),
      } as Response);

      await act(async () => {
        await result.current.saveQuestion(pendingId!, switched);
      });

      expect(JSON.parse(postSpy.mock.calls[0][1] as string)).toMatchObject({
        type: 'MultipleSelectQuestion',
        correctChoiceIds: ['a', 'b'],
      });
    });
  });

  describe('removeQuestion', () => {
    it('drops a pending question locally, leaving nothing to save', async () => {
      const {result} = await renderLoaded();
      let pendingId: number | undefined;
      act(() => {
        pendingId = result.current.addPendingQuestion(
          1,
          'MultipleChoiceQuestion'
        );
      });

      await act(async () => {
        await result.current.removeQuestion(pendingId!, {permanently: true});
      });

      expect(result.current.questions.map(q => q.id)).toEqual([7]);
      expect(result.current.hasUnsavedLayout).toBe(false);
    });

    it('takes a question off the quiz locally, with no network call', async () => {
      const {result} = await renderLoaded();

      await act(async () => {
        await result.current.removeQuestion(7, {permanently: false});
      });

      expect(postSpy).not.toHaveBeenCalled();
      expect(putSpy).not.toHaveBeenCalled();
      expect(result.current.questions).toEqual([]);
      expect(result.current.hasUnsavedLayout).toBe(true);
    });
  });

  describe('saveQuiz', () => {
    const savedResponse = (placements: object[], newVersion = 6) =>
      ({json: async () => ({version: newVersion, placements})} as Response);

    it('sends the layout, deletions and version, then takes the saved version', async () => {
      const {result} = await renderLoaded();
      await act(async () => {
        await result.current.removeQuestion(7, {permanently: true});
      });
      putSpy.mockResolvedValue(savedResponse([]));

      let saved;
      await act(async () => {
        saved = await result.current.saveQuiz();
      });

      expect(putSpy).toHaveBeenCalledWith(
        '/levels/42/quiz_configuration',
        JSON.stringify({version: 5, placements: [], deleteQuestionIds: [7]}),
        true,
        {'Content-Type': 'application/json'}
      );
      expect(saved).toBe(true);
      expect(version.current).toBe(6);
      expect(result.current.hasUnsavedLayout).toBe(false);
    });

    it('keeps a question removed from the quiz in the bank by leaving it out of deleteQuestionIds', async () => {
      const {result} = await renderLoaded();
      await act(async () => {
        await result.current.removeQuestion(7, {permanently: false});
      });
      putSpy.mockResolvedValue(savedResponse([]));

      await act(async () => {
        await result.current.saveQuiz();
      });

      expect(JSON.parse(putSpy.mock.calls[0][1] as string)).toMatchObject({
        placements: [],
        deleteQuestionIds: [],
      });
    });

    it('drops empty pages from what it sends', async () => {
      const {result} = await renderLoaded();
      act(() => {
        result.current.addPage();
      });
      putSpy.mockResolvedValue(
        savedResponse([{quizQuestionId: 7, page: 1, position: 1}])
      );

      await act(async () => {
        await result.current.saveQuiz();
      });

      expect(JSON.parse(putSpy.mock.calls[0][1] as string).placements).toEqual([
        {quizQuestionId: 7, page: 1, position: 1},
      ]);
      expect(result.current.pages.map(p => p.page)).toEqual([1]);
    });

    it('moves questions up past a page emptied before the save', async () => {
      getSpy.mockResolvedValue({
        json: async () => ({
          version: 5,
          questions: [QUESTION, {...QUESTION, id: 8, page: 2}],
        }),
      } as Response);
      const {result} = await renderLoaded();
      await act(async () => {
        await result.current.removeQuestion(7, {permanently: false});
      });
      putSpy.mockResolvedValue(
        savedResponse([{quizQuestionId: 8, page: 1, position: 1}])
      );

      await act(async () => {
        await result.current.saveQuiz();
      });

      expect(result.current.pages).toEqual([
        {page: 1, questions: [expect.objectContaining({id: 8})]},
      ]);
      expect(result.current.hasUnsavedLayout).toBe(false);
    });

    it('keeps a newer version when its response arrives late', async () => {
      const {result} = await renderLoaded();
      await act(async () => {
        await result.current.removeQuestion(7, {permanently: false});
      });
      // A configuration save from this tab has already recorded version 9.
      version.current = 9;
      putSpy.mockResolvedValue(savedResponse([], 6));

      await act(async () => {
        await result.current.saveQuiz();
      });

      expect(version.current).toBe(9);
    });

    it('keeps a removal made during the save as unsaved', async () => {
      const {result} = await renderLoaded();
      let resolvePut: (response: Response) => void = () => {};
      putSpy.mockReturnValue(
        new Promise<Response>(resolve => {
          resolvePut = resolve;
        })
      );

      let saving: Promise<boolean> = Promise.resolve(false);
      act(() => {
        saving = result.current.saveQuiz();
      });
      await act(async () => {
        await result.current.removeQuestion(7, {permanently: true});
      });
      await act(async () => {
        resolvePut(savedResponse([{quizQuestionId: 7, page: 1, position: 1}]));
        await saving;
      });

      expect(result.current.questions).toEqual([]);
      expect(result.current.hasUnsavedLayout).toBe(true);

      putSpy.mockResolvedValue(savedResponse([], 7));
      await act(async () => {
        await result.current.saveQuiz();
      });

      expect(JSON.parse(putSpy.mock.calls[1][1] as string)).toMatchObject({
        version: 6,
        placements: [],
        deleteQuestionIds: [7],
      });
    });

    it("surfaces the server's message and keeps the changes when the quiz changed since it loaded", async () => {
      const {result} = await renderLoaded();
      await act(async () => {
        await result.current.removeQuestion(7, {permanently: false});
      });
      putSpy.mockRejectedValue(
        new NetworkError('409 Conflict', {
          json: async () => ({error: 'This quiz was changed somewhere else.'}),
        } as Response)
      );

      let saved;
      await act(async () => {
        saved = await result.current.saveQuiz();
      });

      expect(saved).toBe(false);
      expect(result.current.error).toBe(
        'This quiz was changed somewhere else.'
      );
      expect(result.current.errorQuestionId).toBeNull();
      expect(result.current.hasUnsavedLayout).toBe(true);
      expect(version.current).toBe(5);
    });

    it('refuses to save while a question is still unsaved', async () => {
      const {result} = await renderLoaded();
      act(() => {
        result.current.addPendingQuestion(1, 'MultipleChoiceQuestion');
      });

      let saved;
      await act(async () => {
        saved = await result.current.saveQuiz();
      });

      expect(saved).toBe(false);
      expect(putSpy).not.toHaveBeenCalled();
      expect(result.current.error).toBe(
        'Save every question before saving the quiz.'
      );
    });
  });
});
