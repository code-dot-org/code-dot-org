import {useCallback, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {networkErrorMessage} from './networkError';
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

// Loads a quiz's placed questions and creates new ones. The GET also
// carries the quiz's configuration fields; those are owned by
// QuizConfigurationPanel, so this hook reads only `questions`.
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

  // On success, replaces the edited question in place. Its id may differ
  // from the one saved - QuizQuestionsController#update forks a question
  // that's used in a published unit rather than editing it in place, so
  // the response is the new source of truth for this row, not just a
  // confirmation of what was sent.
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
        return true;
      } catch (e) {
        setError(await networkErrorMessage(e));
        return false;
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
