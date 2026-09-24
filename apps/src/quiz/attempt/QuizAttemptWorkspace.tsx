import {Button as MuiButton, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {QuizQuestionSummary} from '../types';

import MultiChoiceQuestionContainer from './MultiChoiceQuestionContainer';
import QuizFooter from './QuizFooter';
import useQuizAttempt from './useQuizAttempt';

import styles from './quiz-attempt-workspace.module.scss';

export interface QuizAttemptWorkspaceProps {
  levelId: number;
  // Attempt tracking only applies inside a unit.
  unitId: number | undefined;
  quizQuestions: QuizQuestionSummary[];
  allowMultipleAttempts?: boolean;
}

const QuizAttemptWorkspace: React.FunctionComponent<
  QuizAttemptWorkspaceProps
> = ({levelId, unitId, quizQuestions, allowMultipleAttempts}) => {
  const {
    attempt,
    isLoading,
    error,
    beginAttempt,
    finishAttempt,
    submitQuestionResponse,
  } = useQuizAttempt({
    levelId,
    unitId,
  });

  // currentPageNumber is a 1-based position into this list, not a raw page value.
  const pageNumbers = Array.from(new Set(quizQuestions.map(q => q.page))).sort(
    (a, b) => a - b
  );
  const totalPages = pageNumbers.length || 1;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [selectedChoicesByQuestionId, setSelectedChoicesByQuestionId] =
    useState<Record<number, string>>({});
  // One chained promise per question, so a rapid second pick waits for the
  // first write to settle instead of racing it, and finishAttempt can wait
  // for all of them before the server locks the attempt.
  const pendingWritesByQuestionIdRef = useRef<Record<number, Promise<unknown>>>(
    {}
  );

  const questionsRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPageNumber(1);
    setSelectedChoicesByQuestionId({});
    pendingWritesByQuestionIdRef.current = {};
  }, [attempt?.id]);

  const isAttemptInProgress =
    !isLoading && !!unitId && !!attempt && !attempt.submittedAt;

  // Focus on the new page's heading when navigating to a new page.
  useEffect(() => {
    questionsRef.current?.querySelector<HTMLElement>('h2')?.focus();
  }, [currentPageNumber, isAttemptInProgress]);

  // Focus on the Retake button or the result message when the attempt is submitted.
  useEffect(() => {
    if (!attempt?.submittedAt) {
      return;
    }
    const target =
      submittedRef.current?.querySelector<HTMLElement>('button') ??
      submittedRef.current?.querySelector<HTMLElement>('[tabindex]');
    target?.focus();
  }, [attempt?.submittedAt]);

  const handleBeginAttempt = async () => {
    try {
      await beginAttempt();
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleFinishAttempt = async () => {
    // Send the student's current answers with submit, so grading is based
    // on what they see on screen rather than whatever autosave last landed.
    const responsesByQuestionId = Object.fromEntries(
      Object.entries(selectedChoicesByQuestionId).map(
        ([questionId, choiceId]) => [questionId, {selectedChoiceId: choiceId}]
      )
    );
    try {
      await finishAttempt(responsesByQuestionId);
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleSelectChoice = (questionId: number, choiceId: string) => {
    const previousChoiceId = selectedChoicesByQuestionId[questionId];
    setSelectedChoicesByQuestionId(prev => ({...prev, [questionId]: choiceId}));

    // Chain onto this question's own pending write, if any, so writes for
    // the same question reach the server in the order they were made.
    const previousWrite =
      pendingWritesByQuestionIdRef.current[questionId] ?? Promise.resolve();
    const thisWrite = previousWrite
      .catch(() => {
        // An earlier write's failure shouldn't stop this one from sending.
      })
      .then(() =>
        submitQuestionResponse(questionId, {selectedChoiceId: choiceId})
      )
      .catch(() => {
        // Already recorded as a user-facing error in useQuizAttempt. Only
        // roll back if nothing newer has been picked since this write
        // started - a later choice landing after this failure must stand.
        setSelectedChoicesByQuestionId(prev => {
          if (prev[questionId] !== choiceId) {
            return prev;
          }
          const next = {...prev};
          if (previousChoiceId === undefined) {
            delete next[questionId];
          } else {
            next[questionId] = previousChoiceId;
          }
          return next;
        });
      });
    pendingWritesByQuestionIdRef.current[questionId] = thisWrite;
  };

  const handleNext = async () => {
    if (currentPageNumber >= totalPages) {
      // Every answer must reach the server before it locks the attempt -
      // otherwise a still-in-flight write loses the race and is recorded
      // as skipped.
      await Promise.allSettled(
        Object.values(pendingWritesByQuestionIdRef.current)
      );
      await handleFinishAttempt();
    } else {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  };

  return (
    <div className={styles.attemptWorkspace}>
      <div className={styles.attemptBody}>
        {error && (
          <Typography variant="body3" color="error" role="alert">
            {error}
          </Typography>
        )}
        {isLoading ? (
          <Typography variant="body2">Loading…</Typography>
        ) : !unitId ? (
          // Reachable via /levels/:id, which levelbuilder uses to preview
          // a level outside any unit.
          <Typography variant="body2">
            Quiz attempts are not allowed on a standalone level.
          </Typography>
        ) : !attempt ? (
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            type="button"
            onClick={handleBeginAttempt}
          >
            Begin Quiz
          </MuiButton>
        ) : attempt.submittedAt ? (
          <div ref={submittedRef}>
            <Typography variant="body2" tabIndex={-1}>
              Submitted. Score: {attempt.score} / {attempt.maxScore}
            </Typography>
            {attempt.canRetake && (
              <MuiButton
                variant="contained"
                color="primary"
                size="medium"
                type="button"
                onClick={handleBeginAttempt}
              >
                Retake Quiz
              </MuiButton>
            )}
          </div>
        ) : (
          <div className={styles.questions} ref={questionsRef}>
            {quizQuestions
              .filter(
                question => question.page === pageNumbers[currentPageNumber - 1]
              )
              // Only MultipleChoiceQuestion has a container built so far.
              .filter(question => question.type === 'MultipleChoiceQuestion')
              .map(question => (
                <MultiChoiceQuestionContainer
                  key={question.id}
                  question={question}
                  questionLabel={
                    quizQuestions.length > 1
                      ? `Question ${
                          quizQuestions.findIndex(q => q.id === question.id) + 1
                        } of ${quizQuestions.length}`
                      : undefined
                  }
                  selectedChoiceId={
                    selectedChoicesByQuestionId[question.id] ?? null
                  }
                  onSelectChoice={choiceId =>
                    handleSelectChoice(question.id, choiceId)
                  }
                />
              ))}
          </div>
        )}
      </div>
      {isAttemptInProgress && (
        <QuizFooter
          currentPageNumber={currentPageNumber}
          totalPages={totalPages}
          onNavigateToPage={setCurrentPageNumber}
          onNext={handleNext}
          finishButtonLabel={allowMultipleAttempts ? 'Finish' : 'Submit'}
        />
      )}
    </div>
  );
};

export default QuizAttemptWorkspace;
