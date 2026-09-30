// A questions step: one question at a time, full page. A multiple-choice
// question gates the next until answered correctly; every submission
// before that is recorded through onAnswer. Free response and scale are
// not ported yet and show a placeholder.
//
// Advancing plays a short exit animation on the current question card,
// then the next question mounts (keyed by question id) with an entrance
// animation.

import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  AnswerRecord,
  StudentInputs,
  answerRecord,
  isPassed,
  reachableThrough,
} from '../../progress';
import {
  MultipleChoiceQuestion as MultipleChoiceContent,
  Question,
  QuestionsStep as QuestionsStepContent,
} from '../../types';

import MultipleChoiceQuestion, {Feedback} from './MultipleChoiceQuestion';
import QuestionProgress from './QuestionProgress';
import SubmitButton from './SubmitButton';

import styles from './questionsStep.module.scss';
import shared from '../shared.module.scss';

const CORRECT_ADVANCE_DELAY_MS = 700;
// Must cover the question-exit animation duration in questionsStep.module.scss.
const EXIT_TRANSITION_MS = 220;

const FEEDBACK_TEXT: {[kind in Feedback]: string} = {
  correct: 'Correct!',
  incorrect: 'Not quite — try again!',
};

interface QuestionsStepProps {
  step: QuestionsStepContent;
  /** Recorded answers; they prefill questions and decide which are reachable. */
  inputs: StudentInputs;
  onAnswer: (record: AnswerRecord) => void;
  /** Called when the last question is done. */
  onComplete: () => void;
}

const QuestionsStep: React.FunctionComponent<QuestionsStepProps> = ({
  step,
  inputs,
  onAnswer,
  onComplete,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState(() =>
    recordedChoice(step.questions[0], inputs)
  );
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  // True while the current question plays its exit animation.
  const [exiting, setExiting] = useState(false);
  const [shakeNonce, setShakeNonce] = useState(0);
  // Focus moves to a question only once the student has moved at least once.
  const [navigated, setNavigated] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>();
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>();
  // The exit timer reads the answers as they are when it fires.
  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;

  const question = step.questions[qIndex];
  const isLast = qIndex >= step.questions.length - 1;
  const reachable = reachableThrough(step, inputs);
  const locked = exiting || feedback === 'correct';

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
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      setExiting(true);
      exitTimer.current = setTimeout(() => {
        setExiting(false);
        setFeedback(undefined);
        setNavigated(true);
        setSelectedChoiceId(
          recordedChoice(step.questions[target], inputsRef.current)
        );
        setQIndex(target);
      }, EXIT_TRANSITION_MS);
    },
    [qIndex, exiting, step.questions]
  );

  const goToNextQuestion = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    transitionTo(qIndex + 1);
  }, [isLast, onComplete, transitionTo, qIndex]);

  const submit = () => {
    if (question.type !== 'MultipleChoiceQuestion' || !selectedChoiceId) {
      return;
    }
    const previous = inputs[question.id];
    if (isPassed(previous)) {
      goToNextQuestion();
      return;
    }

    const record = answerRecord(step, question, selectedChoiceId, previous);
    onAnswer(record);

    if (record.outcome === 'incorrect') {
      setFeedback('incorrect');
      setShakeNonce(n => n + 1);
      return;
    }

    // Let the student see the "Correct!" beat before moving on.
    setFeedback('correct');
    advanceTimer.current = setTimeout(
      goToNextQuestion,
      CORRECT_ADVANCE_DELAY_MS
    );
  };

  return (
    <div className={styles.questionFlow}>
      {step.questions.length > 1 && (
        <QuestionProgress
          questions={step.questions}
          current={qIndex}
          reachable={reachable}
          disabled={locked}
          onSelect={transitionTo}
        />
      )}
      <div
        key={question.id}
        className={`${styles.questionCard} ${
          exiting ? styles.questionExit : styles.questionEnter
        }`}
      >
        {question.type === 'MultipleChoiceQuestion' ? (
          <>
            <MultipleChoiceQuestion
              question={question}
              selectedChoiceId={selectedChoiceId}
              onSelectChoice={choiceId => {
                setSelectedChoiceId(choiceId);
                setFeedback(undefined);
              }}
              verdict={isPassed(inputs[question.id]) ? 'correct' : feedback}
              disabled={locked || isPassed(inputs[question.id])}
              shakeNonce={shakeNonce}
              focusOnMount={navigated}
            />
            {isPassed(inputs[question.id]) && (
              <p className={styles.passedNote}>Answered correctly</p>
            )}
            <SubmitButton
              disabled={!selectedChoiceId}
              locked={locked}
              onClick={submit}
            >
              {isLast ? 'Finish →' : 'Next →'}
            </SubmitButton>
          </>
        ) : (
          <UnportedQuestion
            question={question}
            isLast={isLast}
            locked={locked}
            focusOnMount={navigated}
            onContinue={goToNextQuestion}
          />
        )}
      </div>
      <div role="status" className={styles.feedbackRegion}>
        {feedback && (
          <span
            className={
              feedback === 'correct'
                ? styles.questionFeedbackCorrect
                : styles.questionFeedbackIncorrect
            }
          >
            {FEEDBACK_TEXT[feedback]}
          </span>
        )}
      </div>
    </div>
  );
};

interface UnportedQuestionProps {
  question: Exclude<Question, MultipleChoiceContent>;
  isLast: boolean;
  locked: boolean;
  focusOnMount: boolean;
  onContinue: () => void;
}

const UnportedQuestion: React.FunctionComponent<UnportedQuestionProps> = ({
  question,
  isLast,
  locked,
  focusOnMount,
  onContinue,
}) => {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) heading.current?.focus();
  }, [focusOnMount]);

  return (
    <>
      <h2 ref={heading} tabIndex={-1} className={shared.questionPrompt}>
        {question.text}
      </h2>
      <p className={shared.muted}>
        This question type ({question.type}) is not available yet.
      </p>
      <SubmitButton locked={locked} onClick={onContinue}>
        {isLast ? 'Finish →' : 'Continue →'}
      </SubmitButton>
    </>
  );
};

function recordedChoice(question: Question, inputs: StudentInputs) {
  return question.type === 'MultipleChoiceQuestion'
    ? inputs[question.id]?.selectedChoiceId ?? null
    : null;
}

export default QuestionsStep;
