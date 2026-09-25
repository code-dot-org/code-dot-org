import {useCallback, useEffect, useRef, useState} from 'react';

import {networkErrorMessage} from '@cdo/apps/quiz/networkError';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  isPendingQuestionId,
  QuizBuilderQuestion,
  QuizBuilderQuestionsState,
  QuizQuestionEditableFields,
} from './types';

const NEW_QUESTION_DEFAULTS = {
  questionName: 'New question',
  stem: 'New question',
  choices: [
    {id: '0', text: 'Option A'},
    {id: '1', text: 'Option B'},
  ],
  correctChoiceId: '0',
};

// A hook for managing a quiz's questions.
// Provides the current state of the quiz's questions, including loading and error states.
// Also returns functions to create, update, and remove a quiz's questions.
export default function useQuizBuilderQuestions(
  levelId: number
): QuizBuilderQuestionsState {
  const [questions, setQuestions] = useState<QuizBuilderQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ids handed to locally-created, not-yet-saved questions - see
  // isPendingQuestionId. Decrementing keeps them distinct from each other
  // and from any real (positive) server id.
  const nextPendingId = useRef(-1);
  // null for load/create, which can't fail because of anything about an
  // existing question - a caller uses this to tell a general error (show
  // it once, globally) from one that belongs on a specific question's card.
  const [errorQuestionId, setErrorQuestionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorQuestionId(null);
    try {
      const response = await HttpClient.get(
        `/levels/${levelId}/quiz_configuration`
      );
      const body = await response.json();
      setQuestions(body.questions ?? []);
    } catch (e) {
      setError(await networkErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    load();
  }, [load]);

  const addPendingQuestion = useCallback(() => {
    const id = nextPendingId.current--;
    setQuestions(prev => [
      ...prev,
      {
        id,
        type: 'MultipleChoiceQuestion',
        ...NEW_QUESTION_DEFAULTS,
        explanation: null,
        standards: [],
        attachedToOtherQuizzes: false,
        usedInPublishedUnit: false,
        page: 1,
      },
    ]);
    return id;
  }, []);

  // Resolves with the saved question's id, which may differ from the one
  // passed in: a pending question (see isPendingQuestionId) is created
  // server-side on its first save, and QuizQuestionsController#update
  // forks a question that's used in a published unit rather than editing
  // it in place.
  const saveQuestion = useCallback(
    async (id: number, payload: QuizQuestionEditableFields) => {
      setError(null);
      setErrorQuestionId(null);
      try {
        const response = isPendingQuestionId(id)
          ? await HttpClient.post(
              `/levels/${levelId}/quiz_question_placements`,
              JSON.stringify({...payload, page: 1}),
              true,
              {'Content-Type': 'application/json'}
            )
          : await HttpClient.put(
              `/quiz_questions/${id}?quizLevelId=${levelId}`,
              JSON.stringify(payload),
              true,
              {'Content-Type': 'application/json'}
            );
        const saved: QuizBuilderQuestion = await response.json();
        setQuestions(prev =>
          prev.map(question => (question.id === id ? saved : question))
        );
        return saved.id;
      } catch (e) {
        setError(await networkErrorMessage(e));
        setErrorQuestionId(id);
        return undefined;
      }
    },
    [levelId]
  );

  // A pending question only exists locally, so removing one is just a
  // local drop. Otherwise, detaches the question from this quiz - the
  // endpoint itself decides whether to also hard-delete it, which it
  // leaves alone if something else still references it.
  const removeQuestion = useCallback(
    async (id: number) => {
      if (isPendingQuestionId(id)) {
        setQuestions(prev => prev.filter(question => question.id !== id));
        return true;
      }
      setError(null);
      setErrorQuestionId(null);
      try {
        await HttpClient.delete(
          `/levels/${levelId}/quiz_question_placements/${id}`,
          true
        );
        setQuestions(prev => prev.filter(question => question.id !== id));
        return true;
      } catch (e) {
        setError(await networkErrorMessage(e));
        setErrorQuestionId(id);
        return false;
      }
    },
    [levelId]
  );

  return {
    questions,
    isLoading,
    error,
    errorQuestionId,
    addPendingQuestion,
    saveQuestion,
    removeQuestion,
    load,
  };
}
