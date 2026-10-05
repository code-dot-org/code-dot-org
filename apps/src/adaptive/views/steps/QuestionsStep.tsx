// Plays a questions step as an ungraded survey, using quiz's question cards
// and footer so it looks like a quiz level without quiz's attempt lifecycle.

import {Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import AttemptCard from '@cdo/apps/quiz/attempt/AttemptCard';
import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';
import QuizFooter from '@cdo/apps/quiz/attempt/QuizFooter';

import {StepAnswers} from '../../progress';
import {
  MultipleChoiceQuestion,
  QuestionsStep as QuestionsStepContent,
} from '../../types';

import styles from './stepPlayer.module.scss';

interface QuestionsStepProps {
  step: QuestionsStepContent;
  answers: StepAnswers;
  onSelectChoice: (questionId: number, choiceId: string) => void;
  continueLabel: string;
  onComplete: () => void;
}

const QuestionsStep: React.FunctionComponent<QuestionsStepProps> = ({
  step,
  answers,
  onSelectChoice,
  continueLabel,
  onComplete,
}) => {
  const questions = useMemo(
    () =>
      step.questions.filter(
        (q): q is MultipleChoiceQuestion => q.type === 'MultipleChoiceQuestion'
      ),
    [step.questions]
  );
  // currentPageNumber is a 1-based position into this list, not a raw page value.
  const pageNumbers = Array.from(new Set(questions.map(q => q.page))).sort(
    (a, b) => a - b
  );
  const totalPages = pageNumbers.length || 1;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const questionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    questionsRef.current?.querySelector<HTMLElement>('h2')?.focus();
  }, [currentPageNumber]);

  const handleNext = () => {
    if (currentPageNumber >= totalPages) {
      onComplete();
    } else {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  };

  return (
    <div className={styles.questionsStep}>
      <div className={styles.questionsBody} ref={questionsRef}>
        {currentPageNumber === 1 && (
          <AttemptCard
            title={step.title}
            description={
              step.description && (
                <MuiTypography variant="body2">
                  {step.description}
                </MuiTypography>
              )
            }
          />
        )}
        {questions
          .filter(q => q.page === pageNumbers[currentPageNumber - 1])
          .map(question => (
            <MultiChoiceQuestionContainer
              key={question.id}
              question={question}
              questionLabel={
                questions.length > 1
                  ? `Question ${questions.indexOf(question) + 1} of ${
                      questions.length
                    }`
                  : undefined
              }
              selectedChoiceId={answers[question.id] ?? null}
              onSelectChoice={choiceId => onSelectChoice(question.id, choiceId)}
            />
          ))}
      </div>
      <QuizFooter
        currentPageNumber={currentPageNumber}
        totalPages={totalPages}
        onNavigateToPage={setCurrentPageNumber}
        onNext={handleNext}
        finishButtonLabel={continueLabel}
        finishDisabled={!allAnswered}
      />
    </div>
  );
};

export default QuestionsStep;
