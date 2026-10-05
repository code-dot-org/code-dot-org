// Plays a questions step with quiz's question card, so it looks like a quiz
// level without quiz's attempt lifecycle. A graded question is checked on
// Submit and must be answered correctly to move on.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';

import {Answer, StepAnswers} from '../../progress';
import {
  MultipleChoiceQuestion,
  QuestionsStep as QuestionsStepContent,
} from '../../types';

import styles from './stepPlayer.module.scss';

// Long enough to read "Correct!" before the step changes.
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
  const questions = useMemo(
    () =>
      [step.question].filter(
        (q): q is MultipleChoiceQuestion => q.type === 'MultipleChoiceQuestion'
      ),
    [step.question]
  );
  // Picks stay local until Submit; only submitted answers are saved.
  const [selectedChoiceIds, setSelectedChoiceIds] = useState(() => {
    const restored: {[questionId: number]: string} = {};
    for (const q of questions) {
      const last = answers[q.id]?.slice(-1)[0];
      if (last) restored[q.id] = last.answerId;
    }
    return restored;
  });
  const currentChoice = (q: MultipleChoiceQuestion) =>
    selectedChoiceIds[q.id] as string | undefined;
  const isAnswered = questions.every(q => !!currentChoice(q));
  const gradedQuestions = questions.filter(q => q.correctChoiceId);
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

  const isAdvancing = feedback === 'correct';
  const handleSubmit = () => {
    if (isAdvancing) return;
    for (const q of questions) {
      const answerId = currentChoice(q);
      if (!answerId) continue;
      const answer = {
        answerId,
        isCorrect: !q.correctChoiceId || answerId === q.correctChoiceId,
      };
      // Graded questions keep every try; survey questions only the last.
      onSaveAnswers(
        q.id,
        q.correctChoiceId ? [...(answers[q.id] ?? []), answer] : [answer]
      );
    }
    if (gradedQuestions.some(q => currentChoice(q) !== q.correctChoiceId)) {
      setFeedback('incorrect');
    } else if (gradedQuestions.length) {
      setFeedback('correct');
    } else {
      onComplete();
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
      {questions.map(question => (
        <MultiChoiceQuestionContainer
          key={question.id}
          question={question}
          selectedChoiceId={currentChoice(question) ?? null}
          onSelectChoice={choiceId => {
            setFeedback(undefined);
            setSelectedChoiceIds(prev => ({...prev, [question.id]: choiceId}));
          }}
          selectedChoiceStatus={
            feedback && question.correctChoiceId
              ? currentChoice(question) === question.correctChoiceId
                ? 'correct'
                : 'incorrect'
              : undefined
          }
        />
      ))}
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
          disabled={!isAnswered}
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
