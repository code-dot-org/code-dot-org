// Plays a questions step one question at a time with quiz's question card,
// so it looks like a quiz level without quiz's attempt lifecycle. A graded
// question is checked on Next or Submit and must be answered correctly to
// move on.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import AttemptCard from '@cdo/apps/quiz/attempt/AttemptCard';
import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';

import {Answer, StepAnswers} from '../../progress';
import {
  FreeResponseQuestion,
  MultipleChoiceDiagnosticQuestion,
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
  const {questions} = step;
  const [index, setIndex] = useState(0);
  const question = questions[index];
  const isLastQuestion = index >= questions.length - 1;

  // MC state: last pick per question, restored from saved answers on mount.
  const [selectedChoiceIds, setSelectedChoiceIds] = useState(() => {
    const restored: {[questionId: number]: string} = {};
    for (const q of questions) {
      if (q.type !== 'MultipleChoiceQuestion') continue;
      const last = answers[q.id]?.slice(-1)[0];
      if (last) restored[q.id] = last.answerId;
    }
    return restored;
  });

  // FR state: text per question, restored from saved answers on mount.
  const [freeResponseTexts, setFreeResponseTexts] = useState(() => {
    const restored: {[questionId: number]: string} = {};
    for (const q of questions) {
      if (q.type !== 'freeResponse') continue;
      const text = answers[q.id]?.at(-1)?.text;
      if (text) restored[q.id] = text;
    }
    return restored;
  });

  const selectedChoiceId =
    question?.type === 'MultipleChoiceQuestion'
      ? selectedChoiceIds[question.id] ?? null
      : null;

  const freeResponseText =
    question?.type === 'freeResponse'
      ? freeResponseTexts[question.id] ?? ''
      : '';

  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();

  const titleRef = useRef<HTMLHeadingElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    // The step title first, then each later question's own heading.
    (index === 0 ? titleRef : questionHeadingRef).current?.focus();
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
    if (isAdvancing || completedRef.current || !question) return;

    if (question.type === 'MultipleChoiceQuestion') {
      if (!selectedChoiceId) return;
      const correctChoiceId = question.correctChoiceId;
      const savedAnswers = answers[question.id] ?? [];
      // Resubmitting the last saved pick is not a new try.
      if (savedAnswers.slice(-1)[0]?.answerId !== selectedChoiceId) {
        const answer: Answer = {
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
    } else if (question.type === 'freeResponse') {
      if (!freeResponseText.trim()) return;
      onSaveAnswers(question.id, [{answerId: '', text: freeResponseText}]);
      advance();
    }
  };

  const isDisabled =
    question?.type === 'MultipleChoiceQuestion'
      ? !selectedChoiceId
      : question?.type === 'freeResponse'
      ? !freeResponseText.trim()
      : true;

  const questionLabel =
    questions.length > 1
      ? `${index + 1}/${questions.length} questions`
      : undefined;

  const renderQuestion = (
    q: MultipleChoiceDiagnosticQuestion | FreeResponseQuestion
  ) => {
    if (q.type === 'MultipleChoiceQuestion') {
      return (
        <MultiChoiceQuestionContainer
          key={q.id}
          headingRef={questionHeadingRef}
          question={q}
          questionLabel={questionLabel}
          selectedChoiceId={selectedChoiceId}
          onSelectChoice={choiceId => {
            setFeedback(undefined);
            setSelectedChoiceIds(prev => ({...prev, [q.id]: choiceId}));
          }}
          selectedChoiceStatus={feedback}
        />
      );
    }
    if (q.type === 'freeResponse') {
      return (
        <AttemptCard
          key={q.id}
          headingRef={questionHeadingRef}
          label={questionLabel}
          title={q.text}
        >
          <textarea
            className={styles.freeResponseTextarea}
            value={freeResponseText}
            onChange={e =>
              setFreeResponseTexts(prev => ({
                ...prev,
                [q.id]: e.target.value,
              }))
            }
            placeholder={q.placeholder}
          />
        </AttemptCard>
      );
    }
  };

  return (
    <div className={styles.questionsStep}>
      <div className={styles.questionsIntro}>
        <MuiTypography variant="h2" tabIndex={-1} ref={titleRef}>
          {step.title}
        </MuiTypography>
        {step.description && (
          <MuiTypography variant="body2">{step.description}</MuiTypography>
        )}
      </div>
      {question &&
        renderQuestion(
          question as MultipleChoiceDiagnosticQuestion | FreeResponseQuestion
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
          disabled={isDisabled}
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
