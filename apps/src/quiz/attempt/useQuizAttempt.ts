import {useCallback, useEffect, useRef, useState} from 'react';

import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';

import {QuizAttemptData} from './types';

interface UseQuizAttemptArgs {
  levelId: number;
  // Attempt tracking only applies inside a unit.
  unitId: number | undefined;
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
    responseData: Record<string, unknown>
  ) => Promise<void>;
  finishAttempt: () => Promise<QuizAttemptData>;
}

export default function useQuizAttempt({
  levelId,
  unitId,
}: UseQuizAttemptArgs): UseQuizAttemptState {
  const [attempt, setAttempt] = useState<QuizAttemptData | null | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz views stay mounted across same-lab navigation, so a late
  // beginAttempt/finishAttempt response can land after level/unit have changed.
  // Guard againt that by keying on the pair.
  const currentAttemptKeyRef = useRef(`${levelId}:${unitId}`);

  useEffect(() => {
    currentAttemptKeyRef.current = `${levelId}:${unitId}`;
    setAttempt(undefined);
    setError(null);
    if (!unitId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let cancelled = false;
    HttpClient.get(`/quiz_attempts?levelId=${levelId}&unitId=${unitId}`)
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
  }, [levelId, unitId]);

  const beginAttempt = useCallback(async () => {
    if (!unitId) {
      throw new Error('No unit - attempt tracking does not apply here.');
    }
    const requestKey = `${levelId}:${unitId}`;
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
  }, [levelId, unitId]);

  const submitQuestionResponse = useCallback(
    async (quizQuestionId: number, responseData: Record<string, unknown>) => {
      if (!attempt) {
        return;
      }
      setError(null);
      try {
        await HttpClient.post(
          '/quiz_question_responses',
          JSON.stringify({
            quizAttemptId: attempt.id,
            quizQuestionId,
            responseData,
          }),
          true,
          {'Content-Type': 'application/json'}
        );
      } catch (postError) {
        setError(await networkErrorMessage(postError));
      }
    },
    [attempt]
  );

  const finishAttempt = useCallback(async () => {
    if (!attempt) {
      throw new Error('No attempt to finalize.');
    }
    const requestKey = `${levelId}:${unitId}`;
    setError(null);
    try {
      const response = await HttpClient.put(
        `/quiz_attempts/${attempt.id}`,
        JSON.stringify({}),
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
  }, [attempt, levelId, unitId]);

  return {
    attempt,
    isLoading,
    error,
    beginAttempt,
    submitQuestionResponse,
    finishAttempt,
  };
}

async function networkErrorMessage(error: unknown): Promise<string> {
  if (isNetworkError(error)) {
    try {
      const data = await error.response.json();
      if (typeof data.error === 'string' && data.error) {
        return data.error;
      }
    } catch {
      // Response body was not JSON.
    }
  }
  return 'Something went wrong.';
}
