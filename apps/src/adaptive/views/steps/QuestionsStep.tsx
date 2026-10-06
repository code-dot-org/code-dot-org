// Plays a questions step with quiz's question card, so it looks like a quiz
// level without quiz's attempt lifecycle. A graded question is checked on
// Submit and must be answered correctly to move on.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';

import {Answer, StepAnswers} from '../../progress';
import {QuestionsStep as QuestionsStepContent} from '../../types';

import styles from './stepPlayer.module.scss';

// Duration that "Correct" is shown on screen for students before
// advancing to the next step.
const CORRECT_ADVANCE_DELAY_MS = 700;

interface QuestionsStepProps {
  step: QuestionsStepContent;
  answers: StepAnswers;
  onSaveAnswers: (questionId: number, answers: Answer[]) => void;
  onComplete: () => void;
}

const QuestionsStep: React.FunctionComponent<QuestionsStepProps> = ({
  step,
  answers,
  onSaveAnswers,
  onComplete,
}) => {
  const question =
    step.question.type === 'MultipleChoiceQuestion' ? step.question : undefined;
  const correctChoiceId = question?.correctChoiceId;
  // The pick stays local until Submit; only submitted answers are saved.
  const [selectedChoiceId, setSelectedChoiceId] = useState(
    () => question && answers[question.id]?.slice(-1)[0]?.answerId
  );
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();

  const questionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    questionsRef.current?.querySelector<HTMLElement>('h2')?.focus();
  }, []);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (feedback !== 'correct') return;
    const timer = setTimeout(
      () => onCompleteRef.current(),
      CORRECT_ADVANCE_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [feedback]);

  const completedRef = useRef(false);
  const isAdvancing = feedback === 'correct';
  const handleSubmit = () => {
    if (isAdvancing || completedRef.current || !question || !selectedChoiceId) {
      return;
    }
    const savedAnswers = answers[question.id] ?? [];
    // Resubmitting the last saved pick is not a new try.
    if (savedAnswers.slice(-1)[0]?.answerId !== selectedChoiceId) {
      const answer = {
        answerId: selectedChoiceId,
        isCorrect: !correctChoiceId || selectedChoiceId === correctChoiceId,
      };
      // Graded questions keep every try; survey questions only the last.
      onSaveAnswers(
        question.id,
        correctChoiceId ? [...savedAnswers, answer] : [answer]
      );
    }
    if (!correctChoiceId) {
      completedRef.current = true;
      onComplete();
    } else {
      setFeedback(
        selectedChoiceId === correctChoiceId ? 'correct' : 'incorrect'
      );
    }
  };

  return (
    <div className={styles.questionsStep} ref={questionsRef}>
      <div className={styles.questionsIntro}>
        <MuiTypography variant="h3" component="h2" tabIndex={-1}>
          {step.title}
        </MuiTypography>
        {step.description && (
          <MuiTypography variant="body2">{step.description}</MuiTypography>
        )}
      </div>
      {question && (
        <MultiChoiceQuestionContainer
          question={question}
          selectedChoiceId={selectedChoiceId ?? null}
          onSelectChoice={choiceId => {
            setFeedback(undefined);
            setSelectedChoiceId(choiceId);
          }}
          selectedChoiceStatus={feedback}
        />
      )}
      <div className={styles.questionsActions}>
        <MuiTypography
          variant="body2"
          role="status"
          className={
            feedback === 'correct'
              ? styles.feedbackCorrect
              : styles.feedbackIncorrect
          }
        >
          {feedback === 'correct' && 'Correct!'}
          {feedback === 'incorrect' && 'Not quite. Try again.'}
        </MuiTypography>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          type="button"
          disabled={!selectedChoiceId}
          // Not disabled while advancing: that would drop keyboard focus.
          aria-disabled={isAdvancing}
          onClick={handleSubmit}
        >
          Submit
        </MuiButton>
      </div>
    </div>
  );
};

export default QuestionsStep;
