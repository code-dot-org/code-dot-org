import {useCallback, useEffect, useRef, useState} from 'react';

import {networkErrorMessage} from '@cdo/apps/quiz/networkError';
import HttpClient from '@cdo/apps/util/HttpClient';

import {QuizQuestionType} from '../types';
import {groupByPage} from '../utils';

import {newMatchPair} from './matchPairs';
import {
  isPendingQuestionId,
  QuizBuilderPage,
  QuizBuilderQuestion,
  QuizBuilderQuestionsState,
  QuizQuestionPayload,
} from './types';

const NEW_QUESTION_DEFAULTS = {
  questionName: 'New question',
  questionTitle: 'New question',
};

const NEW_CHOICES = [
  {id: '0', text: 'Option A'},
  {id: '1', text: 'Option B'},
];

// Each page's question ids, in order; page numbers are positions in the list.
// Unlike placements, it holds empty pages and edits need no renumbering.
type PageLayout = number[][];

// The endpoints also return a question's page. Only load reads it; after
// that the layout says which page a question is on.
type ServerQuestion = QuizBuilderQuestion & {page: number | null};

function withoutPage({page, ...question}: ServerQuestion): QuizBuilderQuestion {
  return question;
}

// A hook for managing a quiz's questions.
// Provides the current state of the quiz's questions, including loading and error states.
// Also returns functions to add new questions, and save and remove existing ones.
export default function useQuizBuilderQuestions(
  levelId: number
): QuizBuilderQuestionsState {
  const [questionsById, setQuestionsById] = useState<
    Record<number, QuizBuilderQuestion>
  >({});
  const [layout, setLayout] = useState<PageLayout>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ids handed to locally-created, not-yet-saved questions - see
  // isPendingQuestionId. Decrementing keeps them distinct from each other
  // and from any real (positive) server id.
  const nextPendingId = useRef(-1);
  // A caller uses this to tell a general error (null) from
  // one that belongs on a specific question's card.
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
      const loaded: ServerQuestion[] = body.questions ?? [];
      setQuestionsById(
        Object.fromEntries(loaded.map(q => [q.id, withoutPage(q)]))
      );
      setLayout(
        groupByPage(loaded).map(({questions}) => questions.map(q => q.id))
      );
    } catch (e) {
      setError(await networkErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    load();
  }, [load]);

  const pages: QuizBuilderPage[] = layout.map((questionIds, index) => ({
    page: index + 1,
    // The same objects as in questionsById: a card resets its draft when its
    // question object changes.
    questions: questionIds.map(id => questionsById[id]),
  }));
  const questions = pages.flatMap(page => page.questions);

  const addPage = useCallback(() => setLayout(prev => [...prev, []]), []);

  const addPendingQuestion = useCallback(
    (page: number, type: QuizQuestionType) => {
      const id = nextPendingId.current--;
      const shared = {
        id,
        ...NEW_QUESTION_DEFAULTS,
        description: null,
        explanation: null,
        standards: [],
        attachedToOtherQuizzes: false,
        usedInPublishedUnit: false,
      };
      let question: QuizBuilderQuestion;
      switch (type) {
        case 'MultipleChoiceQuestion':
          question = {
            ...shared,
            type,
            choices: NEW_CHOICES,
            correctChoiceId: '0',
          };
          break;
        case 'MultipleSelectQuestion':
          question = {
            ...shared,
            type,
            choices: NEW_CHOICES,
            correctChoiceIds: ['0'],
          };
          break;
        case 'FreeResponseQuestion':
          question = {...shared, type};
          break;
        case 'MatchQuestion':
          // We use nondeterministic IDs (via newMatchPair) when generating boilerplate
          // match items to avoid possible exposure of solutions to students.
          question = {
            ...shared,
            type,
            pairs: [
              newMatchPair('Term A', 'Definition A'),
              newMatchPair('Term B', 'Definition B'),
            ],
          };
          break;
      }
      setQuestionsById(prev => ({...prev, [id]: question}));
      setLayout(prev => {
        const next = prev.map(questionIds => [...questionIds]);
        // An empty quiz has no pages until its first question.
        if (next.length === 0) {
          next.push([]);
        }
        next[page - 1].push(id);
        return next;
      });
      return id;
    },
    []
  );

  // Resolves with the saved question's id, which may differ from the one
  // passed in: a pending question (see isPendingQuestionId) is created
  // server-side on its first save, and QuizQuestionsController#update
  // forks a question that's used in a published unit, or whose type
  // changed, rather than editing it in place. Either way the new id takes
  // the old one's place in the layout.
  const saveQuestion = useCallback(
    async (id: number, payload: QuizQuestionPayload) => {
      setError(null);
      setErrorQuestionId(null);
      try {
        const response = isPendingQuestionId(id)
          ? await HttpClient.post(
              `/levels/${levelId}/quiz_question_placements`,
              JSON.stringify({
                ...payload,
                page: layout.findIndex(ids => ids.includes(id)) + 1,
              }),
              true,
              {'Content-Type': 'application/json'}
            )
          : await HttpClient.put(
              `/quiz_questions/${id}?quizLevelId=${levelId}`,
              JSON.stringify(payload),
              true,
              {'Content-Type': 'application/json'}
            );
        const saved = withoutPage(await response.json());
        setQuestionsById(prev => {
          const rest = {...prev};
          delete rest[id];
          return {...rest, [saved.id]: saved};
        });
        setLayout(prev =>
          prev.map(questionIds =>
            questionIds.map(qid => (qid === id ? saved.id : qid))
          )
        );
        return saved.id;
      } catch (e) {
        setError(await networkErrorMessage(e));
        setErrorQuestionId(id);
        return undefined;
      }
    },
    [levelId, layout]
  );

  const dropQuestion = useCallback((id: number) => {
    setLayout(prev =>
      prev.map(questionIds => questionIds.filter(qid => qid !== id))
    );
    setQuestionsById(prev => {
      const rest = {...prev};
      delete rest[id];
      return rest;
    });
  }, []);

  // A pending question only exists locally, so removing one is just a
  // local drop. Otherwise, detaches the question from this quiz - the
  // endpoint itself decides whether to also hard-delete it, which it
  // leaves alone if something else still references it.
  const removeQuestion = useCallback(
    async (id: number) => {
      if (isPendingQuestionId(id)) {
        dropQuestion(id);
        return true;
      }
      setError(null);
      setErrorQuestionId(null);
      try {
        await HttpClient.delete(
          `/levels/${levelId}/quiz_question_placements/${id}`,
          true
        );
        dropQuestion(id);
        return true;
      } catch (e) {
        setError(await networkErrorMessage(e));
        setErrorQuestionId(id);
        return false;
      }
    },
    [levelId, dropQuestion]
  );

  return {
    questions,
    pages,
    isLoading,
    error,
    errorQuestionId,
    addPage,
    addPendingQuestion,
    saveQuestion,
    removeQuestion,
    load,
  };
}
