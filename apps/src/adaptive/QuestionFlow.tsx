// Renders a question step one question at a time. Every submission is
// reported through onAnswer. A question with correct options gates
// progression until the chosen set matches exactly; one without records
// the choice and moves on. A graded question with dontKnowEnabled also
// offers "I don't know", which records a failure, reveals the correct
// options, and unlocks Next without a correct answer.
//
// Transitions are CSS: advancing plays an exit animation on the current
// card, then the next question mounts keyed by id with an entrance
// animation. Wrong answers shake the options.

import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {AnswerRecord, Answers, Question, QuestionStep} from './types';

import styles from './adaptiveView.module.scss';

const CORRECT_ADVANCE_DELAY_MS = 700;
// Must cover the question-exit animation in adaptiveView.module.scss.
const EXIT_TRANSITION_MS = 220;

const SubmitButton: React.FunctionComponent<{
  disabled?: boolean;
  variant?: 'contained' | 'outlined';
  onClick: () => void;
  children: React.ReactNode;
}> = ({disabled, variant = 'contained', onClick, children}) => (
  <MuiButton
    type="button"
    variant={variant}
    color="primary"
    size="large"
    className={styles.pillButton}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </MuiButton>
);

interface QuestionFlowProps {
  step: QuestionStep;
  // Earlier answers, used to prefill a revisited question and to count
  // attempts.
  answers: Answers;
  onAnswer: (record: AnswerRecord) => void;
  // Called once the last question is answered.
  onComplete: () => void;
}

function isGraded(question: Question): boolean {
  return question.options.some(option => option.correct);
}

function isCorrectSelection(question: Question, chosen: string[]): boolean {
  const correct = question.options.filter(o => o.correct).map(o => o.id);
  return (
    chosen.length === correct.length && chosen.every(id => correct.includes(id))
  );
}

const QuestionFlow: React.FunctionComponent<QuestionFlowProps> = ({
  step,
  answers,
  onAnswer,
  onComplete,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<
    {kind: 'correct' | 'incorrect' | 'revealed'; text: string} | undefined
  >();
  // True while the current question plays its exit animation. Inputs lock
  // so a double click cannot submit into the outgoing question.
  const [exiting, setExiting] = useState(false);
  // Bumped on every wrong answer so the shake restarts even when the
  // previous attempt was also wrong: the key remounts the options.
  const [shakeNonce, setShakeNonce] = useState(0);
  // Highest question index reached. The progress dots navigate within
  // [0, maxReached]; it only grows through submission, so gated questions
  // cannot be skipped.
  const [maxReached, setMaxReached] = useState(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>();
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>();

  const question = step.questions[qIndex];
  const isLast = qIndex >= step.questions.length - 1;
  // Once the answer is revealed the options stay locked and Next simply
  // advances, so the student cannot turn a dontKnow into a correct.
  const revealed = feedback?.kind === 'revealed';
  const locked = exiting || feedback?.kind === 'correct' || revealed;

  // Prefill from the recorded answer when the active question changes.
  // `answers` is deliberately not a dependency: prefill happens on
  // question change, not on every save.
  useEffect(() => {
    setSelectedIds(question ? answers[question.id]?.optionIds || [] : []);
    setFeedback(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, qIndex]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    []
  );

  const transitionTo = useCallback(
    (target: number) => {
      if (target === qIndex || exiting) return;
      setExiting(true);
      setMaxReached(m => Math.max(m, target));
      exitTimer.current = setTimeout(() => {
        setExiting(false);
        setQIndex(target);
      }, EXIT_TRANSITION_MS);
    },
    [qIndex, exiting]
  );

  const goToNextQuestion = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    transitionTo(qIndex + 1);
  }, [isLast, onComplete, transitionTo, qIndex]);

  const submit = useCallback(() => {
    if (!question || selectedIds.length === 0) return;
    const graded = isGraded(question);
    const correct = graded && isCorrectSelection(question, selectedIds);

    onAnswer({
      questionId: question.id,
      stepId: step.id,
      optionIds: selectedIds,
      outcome: graded ? (correct ? 'correct' : 'incorrect') : 'accepted',
      attempts: (answers[question.id]?.attempts || 0) + 1,
      at: new Date().toISOString(),
    });

    if (graded && !correct) {
      setFeedback({kind: 'incorrect', text: 'Not quite. Try again!'});
      setShakeNonce(n => n + 1);
      return;
    }
    if (graded) {
      // Let the student see the "Correct!" beat before moving on.
      setFeedback({kind: 'correct', text: 'Correct!'});
      advanceTimer.current = setTimeout(
        goToNextQuestion,
        CORRECT_ADVANCE_DELAY_MS
      );
      return;
    }
    goToNextQuestion();
  }, [step.id, question, selectedIds, answers, onAnswer, goToNextQuestion]);

  const giveUp = useCallback(() => {
    if (!question) return;
    onAnswer({
      questionId: question.id,
      stepId: step.id,
      optionIds: selectedIds,
      outcome: 'dontKnow',
      attempts: (answers[question.id]?.attempts || 0) + 1,
      at: new Date().toISOString(),
    });
    const labels = question.options
      .filter(option => option.correct)
      .map(option => option.label);
    // Naming the answer keeps the reveal usable without the color cue.
    setFeedback({
      kind: 'revealed',
      text:
        labels.length === 1
          ? `The correct answer is ${labels[0]}.`
          : `The correct answers are ${labels.join(', ')}.`,
    });
  }, [step.id, question, selectedIds, answers, onAnswer]);

  if (!question) {
    return (
      <div className={styles.questionFlow}>
        <SubmitButton onClick={onComplete}>Continue</SubmitButton>
      </div>
    );
  }

  const toggleOption = (optionId: string) => {
    setSelectedIds(ids => {
      if (!question.multiSelect) return [optionId];
      return ids.includes(optionId)
        ? ids.filter(id => id !== optionId)
        : [...ids, optionId];
    });
    // A changed selection clears any try-again feedback.
    setFeedback(undefined);
  };

  // Selected options get a verdict tint once graded feedback exists. A
  // reveal tints every correct option and any wrong selection.
  const optionClass = (optionId: string): string => {
    const selected = selectedIds.includes(optionId);
    if (revealed) {
      const correct = question.options.some(
        option => option.id === optionId && option.correct
      );
      if (correct) return styles.questionOptionCorrect;
      return selected ? styles.questionOptionWrong : '';
    }
    if (!selected) return '';
    const classes = [styles.questionOptionSelected];
    if (feedback) {
      classes.push(
        feedback.kind === 'correct'
          ? styles.questionOptionCorrect
          : styles.questionOptionWrong
      );
    }
    return classes.join(' ');
  };

  const optionsClass = `${styles.questionOptions}${
    feedback?.kind === 'incorrect' ? ` ${styles.optionsShake}` : ''
  }`;

  return (
    <div className={styles.questionFlow}>
      {step.questions.length > 1 && (
        <div className={styles.questionProgress}>
          {step.questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              className={
                i === qIndex
                  ? styles.questionDotActive
                  : i <= maxReached
                  ? styles.questionDotDone
                  : ''
              }
              aria-label={`Go to question ${i + 1}`}
              aria-current={i === qIndex ? 'step' : undefined}
              disabled={i > maxReached || i === qIndex || exiting}
              onClick={() => transitionTo(i)}
            />
          ))}
        </div>
      )}
      <div
        key={question.id}
        className={`${styles.questionCard} ${
          exiting ? styles.questionExit : styles.questionEnter
        }`}
      >
        <h2 className={styles.questionPrompt}>{question.prompt}</h2>
        <div
          className={optionsClass}
          key={shakeNonce}
          role="group"
          aria-label={question.prompt}
        >
          {question.options.map(option => (
            <button
              key={option.id}
              type="button"
              className={optionClass(option.id)}
              aria-pressed={selectedIds.includes(option.id)}
              disabled={locked}
              onClick={() => toggleOption(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={styles.questionActions}>
          {isGraded(question) && question.dontKnowEnabled && !revealed && (
            <SubmitButton variant="outlined" disabled={locked} onClick={giveUp}>
              I don't know
            </SubmitButton>
          )}
          {revealed ? (
            <SubmitButton disabled={exiting} onClick={goToNextQuestion}>
              {isLast ? 'Finish' : 'Next'}
            </SubmitButton>
          ) : (
            <SubmitButton
              disabled={selectedIds.length === 0 || locked}
              onClick={submit}
            >
              {isLast ? 'Finish' : 'Next'}
            </SubmitButton>
          )}
        </div>
        {feedback && (
          <div
            role="status"
            className={
              feedback.kind === 'correct'
                ? styles.questionFeedbackCorrect
                : feedback.kind === 'revealed'
                ? styles.questionFeedbackRevealed
                : styles.questionFeedbackIncorrect
            }
          >
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionFlow;
