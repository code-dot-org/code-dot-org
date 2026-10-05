// Plays a questions step with quiz's question cards, so it looks like a quiz
// level without quiz's attempt lifecycle. A question with a correctChoiceId
// is graded on Next and must be answered correctly to move on; the rest are
// survey questions.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import AttemptCard from '@cdo/apps/quiz/attempt/AttemptCard';
import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';
import {groupByPage} from '@cdo/apps/quiz/utils';

import {StepAnswers} from '../../progress';
import {
  MultipleChoiceQuestion,
  QuestionsStep as QuestionsStepContent,
} from '../../types';

import styles from './stepPlayer.module.scss';

// Long enough to read "Correct!" before the page changes.
const CORRECT_ADVANCE_DELAY_MS = 700;

interface QuestionsStepProps {
  step: QuestionsStepContent;
  answers: StepAnswers;
  onSelectChoice: (questionId: number, choiceId: string) => void;
  onComplete: () => void;
}

const QuestionsStep: React.FunctionComponent<QuestionsStepProps> = ({
  step,
  answers,
  onSelectChoice,
  onComplete,
}) => {
  const questions = useMemo(
    () =>
      step.questions.filter(
        (q): q is MultipleChoiceQuestion => q.type === 'MultipleChoiceQuestion'
      ),
    [step.questions]
  );
  const pages = useMemo(() => groupByPage(questions), [questions]);
  const totalPages = pages.length || 1;
  // A 1-based position into pages, not a raw page value.
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const isLastPage = currentPageNumber >= totalPages;
  const pageQuestions = pages[currentPageNumber - 1]?.questions ?? [];
  // Numbered in the order shown, which can differ from the authored order.
  const firstQuestionNumber =
    pages
      .slice(0, currentPageNumber - 1)
      .reduce((count, page) => count + page.questions.length, 0) + 1;
  const currentChoice = (q: MultipleChoiceQuestion) =>
    answers[q.id]?.slice(-1)[0];
  const isPageAnswered = pageQuestions.every(q => !!currentChoice(q));
  const gradedQuestions = pageQuestions.filter(q => q.correctChoiceId);
  // Set by Next on a page with graded questions; any new pick clears it.
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();

  const questionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    questionsRef.current?.querySelector<HTMLElement>('h2')?.focus();
  }, [currentPageNumber]);

  const advance = () => {
    setFeedback(undefined);
    if (isLastPage) {
      onComplete();
    } else {
      setCurrentPageNumber(currentPageNumber + 1);
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
  const handleNext = () => {
    if (isAdvancing) return;
    if (gradedQuestions.some(q => currentChoice(q) !== q.correctChoiceId)) {
      setFeedback('incorrect');
    } else if (gradedQuestions.length) {
      setFeedback('correct');
    } else {
      advance();
    }
  };

  return (
    <div className={styles.questionsStep} ref={questionsRef}>
      {currentPageNumber === 1 && (
        <AttemptCard
          title={step.title}
          description={
            step.description && (
              <MuiTypography variant="body2">{step.description}</MuiTypography>
            )
          }
        />
      )}
      {pageQuestions.map((question, indexInPage) => (
        <MultiChoiceQuestionContainer
          key={question.id}
          question={question}
          questionLabel={
            questions.length > 1
              ? `Question ${firstQuestionNumber + indexInPage} of ${
                  questions.length
                }`
              : undefined
          }
          selectedChoiceId={currentChoice(question) ?? null}
          onSelectChoice={choiceId => {
            setFeedback(undefined);
            onSelectChoice(question.id, choiceId);
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
          endIcon={!isLastPage && <FontAwesomeV6Icon iconName="arrow-right" />}
          disabled={!isPageAnswered}
          // Not disabled while advancing: that would drop keyboard focus.
          aria-disabled={isAdvancing}
          onClick={handleNext}
        >
          {isLastPage ? 'Submit' : 'Next'}
        </MuiButton>
      </div>
    </div>
  );
};

export default QuestionsStep;
