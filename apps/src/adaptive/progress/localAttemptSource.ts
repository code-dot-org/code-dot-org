import {useCallback, useRef, useState} from 'react';

import type {
  QuizAttemptData,
  QuizQuestionResult,
} from '@cdo/apps/quiz/attempt/types';
import type useQuizAttempt from '@cdo/apps/quiz/attempt/useQuizAttempt';

import {MultipleChoiceQuestion, QuestionsStep} from '../types';

type QuizAttemptSource = ReturnType<typeof useQuizAttempt>;

const isMultipleChoice = (q: QuestionsStep['questions'][number]) =>
  q.type === 'MultipleChoiceQuestion';

/** Grades an open attempt against each question's correct choice. */
export function gradeAttempt(
  step: QuestionsStep,
  open: QuizAttemptData,
  responses: Record<number, Record<string, unknown>>,
  now: Date = new Date()
): QuizAttemptData {
  const selected: Record<number, string> = {};
  for (const r of open.questionResultsInProgress ?? []) {
    selected[r.quizQuestionId] = r.selectedChoiceId;
  }
  for (const [id, response] of Object.entries(responses)) {
    if (typeof response.selectedChoiceId === 'string') {
      selected[Number(id)] = response.selectedChoiceId;
    }
  }
  const questions = step.questions.filter(
    isMultipleChoice
  ) as MultipleChoiceQuestion[];
  const questionResults: QuizQuestionResult[] = questions.map(q => {
    const selectedChoiceId = selected[q.id] ?? null;
    return {
      quizQuestionId: q.id,
      selectedChoiceId,
      correct: selectedChoiceId === q.correctChoiceId,
      explanation: null,
      correctChoiceId: q.correctChoiceId,
    };
  });
  const graded: QuizAttemptData = {
    ...open,
    submittedAt: now.toISOString(),
    score: questionResults.filter(r => r.correct).length,
    maxScore: questions.length,
    questionResults,
  };
  delete graded.questionResultsInProgress;
  return graded;
}

/**
 * Quiz attempts for one questions step, kept in the student's progress
 * record instead of on the quiz server.
 */
export function useLocalAttemptSource(
  step: QuestionsStep,
  attempts: QuizAttemptData[],
  save: (attempts: QuizAttemptData[]) => void
): QuizAttemptSource {
  // Writes chain on this rather than on props, which lag a save by a render.
  const latest = useRef(attempts);
  const lastProps = useRef(attempts);
  if (attempts !== lastProps.current) {
    lastProps.current = attempts;
    latest.current = attempts;
  }
  // Changes only on begin and finish: the quiz view resets its selections
  // whenever the attempt's in-progress answers change.
  const [attempt, setAttempt] = useState<QuizAttemptData | null>(
    () => attempts[attempts.length - 1] ?? null
  );
  const canRetake = !!step.allowMultipleAttempts;

  const write = useCallback(
    (list: QuizAttemptData[]) => {
      latest.current = list;
      save(list);
    },
    [save]
  );

  const beginAttempt = useCallback(async () => {
    const n = latest.current.length + 1;
    const begun: QuizAttemptData = {
      id: n,
      attemptNumber: n,
      submittedAt: null,
      score: null,
      maxScore: null,
      expiresAt: null,
      canRetake,
      questionResultsInProgress: [],
    };
    write([...latest.current, begun]);
    setAttempt(begun);
    return begun;
  }, [canRetake, write]);

  const submitQuestionResponse = useCallback(
    async (quizQuestionId: number, responseData: Record<string, unknown>) => {
      const list = latest.current;
      const open = list[list.length - 1];
      const {selectedChoiceId} = responseData;
      if (!open || open.submittedAt || typeof selectedChoiceId !== 'string') {
        return;
      }
      const questionResultsInProgress = [
        ...(open.questionResultsInProgress ?? []).filter(
          r => r.quizQuestionId !== quizQuestionId
        ),
        {quizQuestionId, selectedChoiceId},
      ];
      write([...list.slice(0, -1), {...open, questionResultsInProgress}]);
    },
    [write]
  );

  const finishAttempt = useCallback(
    async (responses: Record<number, Record<string, unknown>>) => {
      const list = latest.current;
      const open = list[list.length - 1];
      if (!open || open.submittedAt) {
        throw new Error('no open attempt to finish');
      }
      const graded = gradeAttempt(step, open, responses);
      write([...list.slice(0, -1), graded]);
      setAttempt(graded);
      return graded;
    },
    [step, write]
  );

  return {
    attempt,
    isLoading: false,
    error: null,
    beginAttempt,
    submitQuestionResponse,
    finishAttempt,
  };
}
