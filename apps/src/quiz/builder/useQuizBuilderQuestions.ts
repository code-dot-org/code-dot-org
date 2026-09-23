import {useCallback, useEffect, useState} from 'react';

import {networkErrorMessage} from '@cdo/apps/quiz/networkError';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  QuizBuilderQuestion,
  QuizBuilderQuestionsState,
  QuizQuestionEditableFields,
} from './types';

// A newly created question needs placeholder-but-valid content:
// MultipleChoiceQuestion rejects a blank stem, fewer than two choices, or
// a correct_choice_id naming none of them. Replacing these is the job of
// the per-question editor, which does not exist yet - for now a create
// just drops a valid stub into the outline.
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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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

  const createQuestion = useCallback(async () => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await HttpClient.post(
        `/levels/${levelId}/quiz_question_placements`,
        JSON.stringify(NEW_QUESTION_DEFAULTS),
        true,
        {'Content-Type': 'application/json'}
      );
      const created: QuizBuilderQuestion = await response.json();
      setQuestions(prev => [...prev, created]);
      return created.id;
    } catch (e) {
      setError(await networkErrorMessage(e));
      return undefined;
    } finally {
      setIsCreating(false);
    }
  }, [levelId]);

  // Resolves with the saved question's id, which may differ from the one
  // passed in - QuizQuestionsController#update forks a question that's
  // used in a published unit rather than editing it in place.
  const updateQuestion = useCallback(
    async (id: number, payload: QuizQuestionEditableFields) => {
      setError(null);
      try {
        const response = await HttpClient.put(
          `/quiz_questions/${id}?quizLevelId=${levelId}`,
          JSON.stringify(payload),
          true,
          {'Content-Type': 'application/json'}
        );
        const updated: QuizBuilderQuestion = await response.json();
        setQuestions(prev =>
          prev.map(question => (question.id === id ? updated : question))
        );
        return updated.id;
      } catch (e) {
        setError(await networkErrorMessage(e));
        return undefined;
      }
    },
    [levelId]
  );

  // Detaches the question from this quiz. The endpoint itself decides
  // whether to also hard-delete the underlying question - it stays in the
  // bank (and on any other quiz) if something else still references it.
  const removeQuestion = useCallback(
    async (id: number) => {
      setError(null);
      try {
        await HttpClient.delete(
          `/levels/${levelId}/quiz_question_placements/${id}`,
          true
        );
        setQuestions(prev => prev.filter(question => question.id !== id));
        return true;
      } catch (e) {
        setError(await networkErrorMessage(e));
        return false;
      }
    },
    [levelId]
  );

  return {
    questions,
    isLoading,
    isCreating,
    error,
    createQuestion,
    updateQuestion,
    removeQuestion,
    load,
  };
}
