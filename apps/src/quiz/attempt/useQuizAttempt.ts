import {useCallback, useEffect, useRef, useState} from 'react';

import {networkErrorMessage} from '@cdo/apps/quiz/networkError';
import HttpClient from '@cdo/apps/util/HttpClient';

import {QuizAttemptData, QuizQuestionResponseData} from './types';

interface UseQuizAttemptArgs {
  levelId: number;
  // Attempt tracking only applies inside a unit.
  unitId: number | undefined;
  // Set when a teacher is viewing a student's attempt instead of their own.
  userId?: number;
}

interface UseQuizAttemptState {
  // undefined while the initial existing-attempt check is in flight; null
  // once checked and there truly isn't one yet.
  attempt: QuizAttemptData | null | undefined;
  isLoading: boolean;
  error: string | null;
  beginAttempt: () => Promise<QuizAttemptData>;
  submitQuestionResponse: (
    quizQuestionId: number,
    responseData: QuizQuestionResponseData
  ) => Promise<void>;
  // responsesByQuestionId is the student's current answer for every
  // question they've answered.
  finishAttempt: (
    responsesByQuestionId: Record<number, QuizQuestionResponseData>
  ) => Promise<QuizAttemptData>;
}

export default function useQuizAttempt({
  levelId,
  unitId,
  userId,
}: UseQuizAttemptArgs): UseQuizAttemptState {
  const [attempt, setAttempt] = useState<QuizAttemptData | null | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Which level/unit/user the attempt state above was loaded for. On a switch, the
  // first render runs before effect below clears state so if stateKey doesn't match
  // current args, report loading instead.
  const argsKey = `${levelId}:${unitId}:${userId}`;
  const [stateKey, setStateKey] = useState<string | null>(null);
  const isStateCurrent = stateKey === argsKey;
  const currentAttempt = isStateCurrent ? attempt : undefined;

  // Quiz views stay mounted across same-lab navigation, so a late
  // beginAttempt/finishAttempt response can land after level/unit have changed.
  // Guard against that by keying on the pair and the viewed user if teacher viewing a student's work.
  const currentAttemptKeyRef = useRef(`${levelId}:${unitId}:${userId}`);

  useEffect(() => {
    currentAttemptKeyRef.current = `${levelId}:${unitId}:${userId}`;
    setStateKey(`${levelId}:${unitId}:${userId}`);
    setAttempt(undefined);
    setError(null);
    if (!unitId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let cancelled = false;
    const userParam = userId === undefined ? '' : `&userId=${userId}`;
    HttpClient.get(
      `/quiz_attempts?levelId=${levelId}&unitId=${unitId}${userParam}`
    )
      .then(response => response.json())
      .then((data: QuizAttemptData | null) => {
        if (!cancelled) {
          setAttempt(data);
        }
      })
      .catch(async fetchError => {
        const message = await networkErrorMessage(fetchError);
        if (!cancelled) {
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [levelId, unitId, userId]);

  const beginAttempt = useCallback(async () => {
    if (!unitId) {
      throw new Error('No unit - attempt tracking does not apply here.');
    }
    const requestKey = `${levelId}:${unitId}:${userId}`;
    setError(null);
    try {
      const response = await HttpClient.post(
        '/quiz_attempts',
        JSON.stringify({levelId, unitId}),
        true,
        {'Content-Type': 'application/json'}
      );
      const data: QuizAttemptData = await response.json();
      // Ignore this result if the level or unit changed while the POST was pending.
      if (currentAttemptKeyRef.current === requestKey) {
        setAttempt(data);
      }
      return data;
    } catch (postError) {
      if (currentAttemptKeyRef.current === requestKey) {
        setError(await networkErrorMessage(postError));
      }
      throw postError;
    }
  }, [levelId, unitId, userId]);

  const submitQuestionResponse = useCallback(
    async (quizQuestionId: number, responseData: QuizQuestionResponseData) => {
      if (!currentAttempt) {
        return;
      }
      setError(null);
      try {
        await HttpClient.post(
          '/quiz_question_responses',
          JSON.stringify({
            quizAttemptId: currentAttempt.id,
            quizQuestionId,
            responseData,
          }),
          true,
          {'Content-Type': 'application/json'}
        );
      } catch (postError) {
        setError(await networkErrorMessage(postError));
        throw postError;
      }
    },
    [currentAttempt]
  );

  const finishAttempt = useCallback(
    async (responsesByQuestionId: Record<number, QuizQuestionResponseData>) => {
      if (!currentAttempt) {
        throw new Error('No attempt to finalize.');
      }
      const requestKey = `${levelId}:${unitId}:${userId}`;
      setError(null);
      try {
        const response = await HttpClient.put(
          `/quiz_attempts/${currentAttempt.id}`,
          JSON.stringify({responses: responsesByQuestionId}),
          true,
          {'Content-Type': 'application/json'}
        );
        const data: QuizAttemptData = await response.json();
        // Same race as beginAttempt - see currentAttemptKeyRef above.
        if (currentAttemptKeyRef.current === requestKey) {
          setAttempt(data);
        }
        return data;
      } catch (putError) {
        if (currentAttemptKeyRef.current === requestKey) {
          setError(await networkErrorMessage(putError));
        }
        throw putError;
      }
    },
    [currentAttempt, levelId, unitId, userId]
  );

  return {
    attempt: currentAttempt,
    isLoading: isStateCurrent ? isLoading : !!unitId,
    error: isStateCurrent ? error : null,
    beginAttempt,
    submitQuestionResponse,
    finishAttempt,
  };
}
