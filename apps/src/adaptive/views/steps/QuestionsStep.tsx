// Plays a questions step one question at a time with quiz's question card,
// so it looks like a quiz level without quiz's attempt lifecycle. A graded
// question is checked on Next or Submit and must be answered correctly to
// move on.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';

import {Answer, StepAnswers} from '../../progress';
import {
  MultipleChoiceQuestion,
  QuestionsStep as QuestionsStepContent,
} from '../../types';

import styles from './stepPlayer.module.scss';

// Duration that "Correct" is shown on screen for students before
// advancing to the next question or step.
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
      step.questions.filter(
        (q): q is MultipleChoiceQuestion => q.type === 'MultipleChoiceQuestion'
      ),
    [step.questions]
  );
  const [index, setIndex] = useState(0);
  const question = questions[index] as MultipleChoiceQuestion | undefined;
  const isLastQuestion = index >= questions.length - 1;
  const correctChoiceId = question?.correctChoiceId;
  // Picks stay local until submitted; only submitted answers are saved.
  const [selectedChoiceIds, setSelectedChoiceIds] = useState(() => {
    const restored: {[questionId: number]: string} = {};
    for (const q of questions) {
      const last = answers[q.id]?.slice(-1)[0];
      if (last) restored[q.id] = last.answerId;
    }
    return restored;
  });
  const selectedChoiceId = question && selectedChoiceIds[question.id];
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();

  const questionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const headings = questionsRef.current?.querySelectorAll<HTMLElement>('h2');
    // The step title first, then each later question's own heading.
    headings?.[index === 0 ? 0 : headings.length - 1]?.focus();
  }, [index]);

  const completedRef = useRef(false);
  const advance = () => {
    setFeedback(undefined);
    if (isLastQuestion) {
      completedRef.current = true;
      onComplete();
    } else {
      setIndex(index + 1);
    }
  };
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useEffect(() => {
    if (feedback !== 'correct') return;
    const timer = setTimeout(
      () => advanceRef.current(),
      CORRECT_ADVANCE_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [feedback]);

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
        isCorrect: correctChoiceId
          ? selectedChoiceId === correctChoiceId
          : undefined,
      };
      // Graded questions keep every try; survey questions only the last.
      onSaveAnswers(
        question.id,
        correctChoiceId ? [...savedAnswers, answer] : [answer]
      );
    }
    if (!correctChoiceId) {
      advance();
    } else {
      setFeedback(
        selectedChoiceId === correctChoiceId ? 'correct' : 'incorrect'
      );
    }
  };

  return (
    <div className={styles.questionsStep} ref={questionsRef}>
      <div className={styles.questionsIntro}>
        <MuiTypography variant="h2" tabIndex={-1}>
          {step.title}
        </MuiTypography>
        {step.description && (
          <MuiTypography variant="body2">{step.description}</MuiTypography>
        )}
      </div>
      {question && (
        <MultiChoiceQuestionContainer
          key={question.id}
          question={question}
          questionLabel={
            questions.length > 1
              ? `${index + 1}/${questions.length} questions`
              : undefined
          }
          selectedChoiceId={selectedChoiceId ?? null}
          onSelectChoice={choiceId => {
            setFeedback(undefined);
            setSelectedChoiceIds(prev => ({...prev, [question.id]: choiceId}));
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
          endIcon={
            !isLastQuestion && <FontAwesomeV6Icon iconName="arrow-right" />
          }
          disabled={!selectedChoiceId}
          // Not disabled while advancing: that would drop keyboard focus.
          aria-disabled={isAdvancing}
          onClick={handleSubmit}
        >
          {isLastQuestion ? 'Submit' : 'Next'}
        </MuiButton>
      </div>
    </div>
  );
};

export default QuestionsStep;
