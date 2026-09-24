import {Button as MuiButton, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {
  sendStartedReportIfNotStarted,
  sendSuccessReportForLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {AppName} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {QuizQuestionSummary, toBool} from '../types';

import AttemptCard from './AttemptCard';
import MultiChoiceQuestionContainer from './MultiChoiceQuestionContainer';
import QuizFooter from './QuizFooter';
import QuizIntroCard from './QuizIntroCard';
import useQuizAttempt from './useQuizAttempt';

import styles from './quiz-attempt-workspace.module.scss';

export interface QuizAttemptWorkspaceProps {
  levelId: number;
  appName: AppName;
  // Levelbuilders may leave displayName blank - falls back to this.
  levelName: string;
  // Attempt tracking only applies inside a unit.
  unitId: number | undefined;
  quizQuestions: QuizQuestionSummary[];
  allowMultipleAttempts?: boolean;
  displayName?: string;
  customIntroText?: string;
  timeLimitMinutes?: number;
  showIntroScreen?: boolean;
}

const QuizAttemptWorkspace: React.FunctionComponent<
  QuizAttemptWorkspaceProps
> = ({
  appName,
  levelId,
  levelName,
  unitId,
  quizQuestions,
  allowMultipleAttempts,
  displayName,
  customIntroText,
  timeLimitMinutes,
  showIntroScreen,
}) => {
  const dispatch = useAppDispatch();
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
  // Retake goes back through the intro screen rather than starting a new
  // attempt immediately.
  const [isRetakeIntroOpen, setIsRetakeIntroOpen] = useState(false);
  // One chained promise per question, so a rapid second pick waits for the
  // first write to settle instead of racing it, and finishAttempt can wait
  // for all of them before the server locks the attempt.
  const pendingWritesByQuestionIdRef = useRef<Record<number, Promise<unknown>>>(
    {}
  );

  const questionsRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef<HTMLDivElement>(null);
  // Quiz views stay mounted across same-lab navigation, so a begin/finish
  // request can resolve after a different level is already current.
  // Gate progress reporting on this level instead.
  const currentLevelKeyRef = useRef(levelId);
  useEffect(() => {
    currentLevelKeyRef.current = levelId;
  }, [levelId]);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPageNumber(1);
    setSelectedChoicesByQuestionId({});
    setIsRetakeIntroOpen(false);
    pendingWritesByQuestionIdRef.current = {};
  }, [attempt?.id]);

  const isAttemptInProgress =
    !isLoading && !!unitId && !!attempt && !attempt.submittedAt;
  const isIntroOpen =
    toBool(showIntroScreen) &&
    (!attempt || (!!attempt.submittedAt && isRetakeIntroOpen));

  // Covers both the very first intro screen and Retake reopening it - either
  // way, the button that led here is gone, so hand focus to the heading.
  useEffect(() => {
    if (isIntroOpen) {
      introRef.current?.querySelector<HTMLElement>('h2')?.focus();
    }
  }, [isIntroOpen]);

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
    const requestLevelId = levelId;
    try {
      await beginAttempt();
      if (currentLevelKeyRef.current === requestLevelId) {
        dispatch(sendStartedReportIfNotStarted(appName));
      }
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleFinishAttempt = async () => {
    // Targets the level the attempt was for, not whichever quiz is current
    // by the time this resolves.
    const requestLevelId = levelId;
    try {
      await finishAttempt();
      dispatch(sendSuccessReportForLevel(requestLevelId.toString(), appName));
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleRetake = () => {
    if (showIntroScreen) {
      setIsRetakeIntroOpen(true);
    } else {
      handleBeginAttempt();
    }
  };

  // A quiz with no intro screen has no click-through step - start the
  // attempt automatically once the initial check finds there isn't one yet.
  useEffect(() => {
    if (!isLoading && !!unitId && attempt === null && !showIntroScreen) {
      beginAttempt().catch(() => {
        // Already recorded as a user-facing error in useQuizAttempt.
      });
    }
  }, [isLoading, unitId, attempt, showIntroScreen, beginAttempt]);

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
        ) : isIntroOpen ? (
          <div className={styles.questions} ref={introRef}>
            <QuizIntroCard
              title={displayName || levelName}
              introText={customIntroText}
              questionCount={quizQuestions.length}
              timeLimitMinutes={timeLimitMinutes}
              allowMultipleAttempts={toBool(allowMultipleAttempts)}
              onBegin={handleBeginAttempt}
            />
          </div>
        ) : !attempt ? (
          // No intro screen to click through - the effect begins the attempt automatically.
          // This button is only shown if the initial check failed.
          error ? (
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              type="button"
              onClick={handleBeginAttempt}
            >
              Begin Quiz
            </MuiButton>
          ) : (
            <Typography variant="body2">Loading…</Typography>
          )
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
                onClick={handleRetake}
              >
                Retake Quiz
              </MuiButton>
            )}
          </div>
        ) : (
          <div className={styles.questions} ref={questionsRef}>
            {currentPageNumber === 1 && !showIntroScreen && (
              <AttemptCard title={displayName || levelName} />
            )}
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
