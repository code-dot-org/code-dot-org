import {useCallback, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {networkErrorMessage} from './networkError';

export interface QuizChoice {
  id: string;
  text: string;
}

// A subset of Standard#summarize_for_lesson_edit - the fields the builder
// reads today. The rest ride along untyped.
export interface StandardSummary {
  frameworkShortcode: string;
  shortcode: string;
  description: string;
}

// Mirrors the Ruby QuizQuestionSerialization#quiz_question_json wire shape,
// as returned by GET /levels/:id/quiz_configuration and by a create.
export interface QuizBuilderQuestion {
  id: number;
  type: string;
  questionName: string;
  stem: string;
  choices: QuizChoice[];
  correctChoiceId: string | null;
  explanation: string | null;
  standards: StandardSummary[];
  attachedToOtherQuizzes: boolean;
  usedInPublishedUnit: boolean;
  page: number | null;
}

export interface QuizBuilderQuestionsState {
  questions: QuizBuilderQuestion[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  createQuestion: () => Promise<void>;
  reload: () => Promise<void>;
}

// A newly created question needs placeholder-but-valid content:
// MultipleChoiceQuestion rejects a blank stem, fewer than two choices, or
// a correct_choice_id naming none of them. Replacing these is the job of
// the per-question editor, which does not exist yet - for now a create
// just drops a valid stub into the outline.
const NEW_QUESTION_DEFAULTS = {
  questionName: 'New question',
  stem: 'New question',
  choices: [
    {id: 'a', text: 'Option A'},
    {id: 'b', text: 'Option B'},
  ],
  correctChoiceId: 'a',
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

  const reload = useCallback(async () => {
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
    reload();
  }, [reload]);

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
    } catch (e) {
      setError(await networkErrorMessage(e));
    } finally {
      setIsCreating(false);
    }
  }, [levelId]);

  return {questions, isLoading, isCreating, error, createQuestion, reload};
}
