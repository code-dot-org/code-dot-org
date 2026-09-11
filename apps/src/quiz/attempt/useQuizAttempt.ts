import {useCallback, useEffect, useState} from 'react';

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
  // Starts, resumes, or retakes - the server decides which based on the
  // latest existing attempt, if any.
  beginAttempt: () => Promise<QuizAttemptData>;
  submitResponse: (
    quizQuestionId: number,
    responseData: Record<string, unknown>
  ) => Promise<void>;
  finalizeAttempt: () => Promise<QuizAttemptData>;
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

  useEffect(() => {
    if (!unitId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    HttpClient.get(`/quiz_attempts?levelId=${levelId}&unitId=${unitId}`)
      .then(response => response.json())
      .then((data: QuizAttemptData | null) => {
        if (!cancelled) {
          setAttempt(data);
        }
      })
      .catch(async fetchError => {
        if (!cancelled) {
          setError(await networkErrorMessage(fetchError));
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
    setError(null);
    try {
      const response = await HttpClient.post(
        '/quiz_attempts',
        JSON.stringify({levelId, unitId}),
        true,
        {'Content-Type': 'application/json'}
      );
      const data: QuizAttemptData = await response.json();
      setAttempt(data);
      return data;
    } catch (postError) {
      setError(await networkErrorMessage(postError));
      throw postError;
    }
  }, [levelId, unitId]);

  const submitResponse = useCallback(
    async (quizQuestionId: number, responseData: Record<string, unknown>) => {
      if (!attempt) {
        return;
      }
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

  const finalizeAttempt = useCallback(async () => {
    if (!attempt) {
      throw new Error('No attempt to finalize.');
    }
    setError(null);
    try {
      const response = await HttpClient.put(
        `/quiz_attempts/${attempt.id}`,
        JSON.stringify({}),
        true,
        {'Content-Type': 'application/json'}
      );
      const data: QuizAttemptData = await response.json();
      setAttempt(data);
      return data;
    } catch (putError) {
      setError(await networkErrorMessage(putError));
      throw putError;
    }
  }, [attempt]);

  return {
    attempt,
    isLoading,
    error,
    beginAttempt,
    submitResponse,
    finalizeAttempt,
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
