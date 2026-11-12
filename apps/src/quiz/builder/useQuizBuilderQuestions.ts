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
  QuizConfigurationData,
  QuizPlacement,
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

const JSON_HEADERS = {'Content-Type': 'application/json'};

// Each page's question ids, in order; page numbers are positions in the list.
// Unlike placements, it holds empty pages and edits need no renumbering.
type PageLayout = number[][];

// The endpoints also return a question's page. Only load reads it; after
// that the layout says which page a question is on.
type ServerQuestion = QuizBuilderQuestion & {page: number | null};

function withoutPage({page, ...question}: ServerQuestion): QuizBuilderQuestion {
  return question;
}

function placementsFromLayout(layout: PageLayout): QuizPlacement[] {
  return layout
    .filter(questionIds => questionIds.length > 0)
    .flatMap((questionIds, pageIndex) =>
      questionIds.map((quizQuestionId, positionIndex) => ({
        quizQuestionId,
        page: pageIndex + 1,
        position: positionIndex + 1,
      }))
    );
}

// Manages a quiz's questions and its layout (which questions it has, on
// which pages, in what order). Question content saves on its own; the layout,
// including removals and deletions, is local until saveQuiz.
export default function useQuizBuilderQuestions(
  levelId: number
): QuizBuilderQuestionsState {
  // The quiz's saved version, which Save quiz sends back.
  const quizVersion = useRef<number | null>(null);
  const [questionsById, setQuestionsById] = useState<
    Record<number, QuizBuilderQuestion>
  >({});
  const [layout, setLayout] = useState<PageLayout>([]);
  // The layout as last loaded or saved, to tell whether it has changed.
  const [savedPlacements, setSavedPlacements] = useState<QuizPlacement[]>([]);
  // Removed questions to delete permanently on save, if nothing else uses them.
  const [deleteQuestionIds, setDeleteQuestionIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
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
      quizVersion.current = body.version ?? null;
      const loadedLayout = groupByPage(loaded).map(({questions}) =>
        questions.map(q => q.id)
      );
      setQuestionsById(
        Object.fromEntries(loaded.map(q => [q.id, withoutPage(q)]))
      );
      setLayout(loadedLayout);
      setSavedPlacements(placementsFromLayout(loadedLayout));
      setDeleteQuestionIds([]);
      setHasLoaded(true);
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
  const hasUnsavedLayout =
    deleteQuestionIds.length > 0 ||
    JSON.stringify(placementsFromLayout(layout)) !==
      JSON.stringify(savedPlacements);

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
        deletable: true,
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
  // the old one's place in the layout, for saveQuiz to place.
  const saveQuestion = useCallback(
    async (id: number, payload: QuizQuestionPayload) => {
      setError(null);
      setErrorQuestionId(null);
      try {
        const response = isPendingQuestionId(id)
          ? await HttpClient.post(
              '/quiz_questions',
              JSON.stringify(payload),
              true,
              JSON_HEADERS
            )
          : await HttpClient.put(
              `/quiz_questions/${id}`,
              JSON.stringify(payload),
              true,
              JSON_HEADERS
            );
        const saved = withoutPage(await response.json());
        const previous = questionsById[id];
        const isFork = !isPendingQuestionId(id) && saved.id !== id;
        setQuestionsById(prev => {
          const rest = {...prev};
          delete rest[id];
          return {
            ...rest,
            [saved.id]: isFork
              ? saved
              : {
                  ...saved,
                  // PUT /quiz_questions/:id counts this quiz in both fields
                  // below; keep the load's values, which leave it out.
                  attachedToOtherQuizzes: previous.attachedToOtherQuizzes,
                  deletable: previous.deletable,
                },
          };
        });
        setLayout(prev =>
          prev.map(questionIds =>
            questionIds.map(qid => (qid === id ? saved.id : qid))
          )
        );
        // A type change replaces a placed question, so the original is deleted
        // on Save quiz unless something else uses it.
        const wasPlaced = savedPlacements.some(p => p.quizQuestionId === id);
        if (isFork && wasPlaced && saved.type !== previous.type) {
          setDeleteQuestionIds(prev => [...prev, id]);
        }
        return saved.id;
      } catch (e) {
        setError(await networkErrorMessage(e));
        setErrorQuestionId(id);
        return undefined;
      }
    },
    [questionsById, savedPlacements]
  );

  // Local until saveQuiz. permanently marks a saved question for deletion
  // instead of only removing it from the quiz (it stays in the question bank).
  const removeQuestion = useCallback(
    async (id: number, {permanently}: {permanently: boolean}) => {
      setLayout(prev =>
        prev.map(questionIds => questionIds.filter(qid => qid !== id))
      );
      setQuestionsById(prev => {
        const rest = {...prev};
        delete rest[id];
        return rest;
      });
      if (permanently && !isPendingQuestionId(id)) {
        setDeleteQuestionIds(prev => [...prev, id]);
      }
      return true;
    },
    []
  );

  const saveQuiz = useCallback(
    async (config: Partial<QuizConfigurationData> = {}) => {
      // Without the loaded layout and version there is nothing to save against.
      if (!hasLoaded) {
        return false;
      }
      if (layout.some(questionIds => questionIds.some(isPendingQuestionId))) {
        setError('Save every question before saving the quiz.');
        setErrorQuestionId(null);
        return false;
      }
      setError(null);
      setErrorQuestionId(null);
      setIsSavingQuiz(true);
      const placements = placementsFromLayout(layout);
      // What this save sends. Edits made while it's in flight, including
      // questions marked for deletion, stay unsaved for the next save.
      const sentLayout = layout;
      const sentDeleteQuestionIds = deleteQuestionIds;
      try {
        const response = await HttpClient.put(
          `/levels/${levelId}/quiz_configuration`,
          JSON.stringify({
            // A field left unset is sent as null, which clears it.
            ...Object.fromEntries(
              Object.entries(config).map(([key, value]) => [key, value ?? null])
            ),
            version: quizVersion.current,
            placements,
            deleteQuestionIds: sentDeleteQuestionIds,
          }),
          true,
          JSON_HEADERS
        );
        const body = await response.json();
        quizVersion.current = body.version;
        // Drops the empty pages that weren't saved, unless the layout changed
        // during the save; those edits stay unsaved.
        setLayout(prev =>
          prev === sentLayout
            ? prev.filter(questionIds => questionIds.length > 0)
            : prev
        );
        setSavedPlacements(placements);
        setDeleteQuestionIds(prev =>
          prev.filter(id => !sentDeleteQuestionIds.includes(id))
        );
        return true;
      } catch (e) {
        setError(await networkErrorMessage(e));
        return false;
      } finally {
        setIsSavingQuiz(false);
      }
    },
    [levelId, hasLoaded, layout, deleteQuestionIds]
  );

  return {
    questions,
    pages,
    isLoading,
    hasLoaded,
    isSavingQuiz,
    error,
    errorQuestionId,
    hasUnsavedLayout,
    addPage,
    addPendingQuestion,
    saveQuestion,
    removeQuestion,
    saveQuiz,
    load,
  };
}
