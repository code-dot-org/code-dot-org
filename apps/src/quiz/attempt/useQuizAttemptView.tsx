import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {QuizLevelProperties, QuizViewContent} from '../types';

import useQuizAttempt from './useQuizAttempt';

export default function useQuizAttemptView({
  levelProperties,
}: LabProps): QuizViewContent {
  const {
    id: levelId,
    name,
    displayName,
  } = levelProperties as QuizLevelProperties;

  const unitId = useAppSelector(state => state.progress.scriptId) ?? undefined;

  const {attempt, isLoading, error, beginAttempt, finishAttempt} =
    useQuizAttempt({
      levelId,
      unitId,
    });

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

  return {
    resourcePanelProps: {},
    workspaceContent: (
      <div>
        <Typography variant="h2">{displayName || name}</Typography>
        {error && (
          <Typography variant="body3" color="error">
            {error}
          </Typography>
        )}
        {isLoading ? (
          <Typography variant="body2">Loading…</Typography>
        ) : !unitId ? (
          // Reachable via /levels/:id, which levelbuilder uses to preview a
          // level outside any unit.
          <Typography variant="body2">
            Attempts are not tracked outside of a unit.
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
          <div>
            <Typography variant="body2">Quiz in progress.</Typography>
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              type="button"
              onClick={handleFinishAttempt}
            >
              Submit Quiz
            </MuiButton>
          </div>
        )}
      </div>
    ),
  };
}
