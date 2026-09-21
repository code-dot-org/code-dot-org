import {Button as MuiButton, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {QuizLevelProperties, QuizViewContent} from '../types';

import QuizFooter from './QuizFooter';
import useQuizAttempt from './useQuizAttempt';

import styles from './quiz-attempt-view.module.scss';

export default function useQuizAttemptView({
  levelProperties,
}: LabProps): QuizViewContent {
  const {
    id: levelId,
    name,
    displayName,
    quizQuestions = [],
  } = levelProperties as QuizLevelProperties;

  const unitId = useAppSelector(state => state.progress.scriptId) ?? undefined;

  const {attempt, isLoading, error, beginAttempt, finishAttempt} =
    useQuizAttempt({
      levelId,
      unitId,
    });

  const totalPages = new Set(quizQuestions.map(q => q.page)).size || 1;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  // A new attempt (begin or retake) starts back on page 1.
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [attempt?.id]);

  const handleBeginAttempt = async () => {
    try {
      await beginAttempt();
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleFinishAttempt = async () => {
    try {
      await finishAttempt();
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleNext = async () => {
    if (currentPageNumber >= totalPages) {
      await handleFinishAttempt();
    } else {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  };

  const isAttemptInProgress =
    !isLoading && !!unitId && !!attempt && !attempt.submittedAt;

  return {
    resourcePanelProps: {},
    workspaceContent: (
      <div className={styles.attemptView}>
        <div className={styles.attemptBody}>
          <Typography variant="h2">{displayName || name}</Typography>
          {error && (
            <Typography variant="body3" color="error">
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
            <div>
              <Typography variant="body2">
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
            <Typography variant="body2">Quiz in progress.</Typography>
          )}
        </div>
        {isAttemptInProgress && (
          <QuizFooter
            currentPageNumber={currentPageNumber}
            totalPages={totalPages}
            onNavigateToPage={setCurrentPageNumber}
            onNext={handleNext}
          />
        )}
      </div>
    ),
  };
}
