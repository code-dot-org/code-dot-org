import {Button as MuiButton, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {QuizLevelProperties, QuizViewContent} from '../types';

import MultiChoiceQuestionContainer from './MultiChoiceQuestionContainer';
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

  const totalPages = new Set(quizQuestions.map(q => q.page)).size || 1;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [selectedChoicesByQuestionId, setSelectedChoicesByQuestionId] =
    useState<Record<number, string>>({});

  useEffect(() => {
    setCurrentPageNumber(1);
    setSelectedChoicesByQuestionId({});
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

  const handleSelectChoice = async (questionId: number, choiceId: string) => {
    setSelectedChoicesByQuestionId(prev => ({...prev, [questionId]: choiceId}));
    try {
      await submitQuestionResponse(questionId, {selectedChoiceId: choiceId});
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
            <div className={styles.questions}>
              {quizQuestions
                .filter(question => question.page === currentPageNumber)
                // Only MultipleChoiceQuestion has a container built so far.
                .filter(question => question.type === 'MultipleChoiceQuestion')
                .map(question => (
                  <MultiChoiceQuestionContainer
                    key={question.id}
                    question={question}
                    questionLabel={
                      quizQuestions.length > 1
                        ? `Question ${
                            quizQuestions.findIndex(q => q.id === question.id) +
                            1
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
          />
        )}
      </div>
    ),
  };
}
