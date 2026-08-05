// Interactive renderer for a questions step: one question at a time in
// the main area — free response, multiple choice (single or check-all),
// or a slider scale.
//
// Every submission is recorded as an AnswerRecord via onAnswer, graded or
// not.  Key-validated questions (an option marked `correct`) gate
// progression to the next question with retries; branch options complete
// the whole step through onComplete(optionId) so the navigation resolver
// can route.
//
// Transitions are pure CSS: advancing plays a short exit animation on the
// current question card, then the next question mounts (keyed by question
// id) with an entrance animation.  Wrong answers shake the options; the
// chosen option is tinted by verdict.  Everything honours
// prefers-reduced-motion via the stylesheet.

import React, {useCallback, useEffect, useRef, useState} from 'react';

import {AnswerRecord, StudentInputs} from './studentInputs';
import {Question, QuestionsStep} from './types';

import styles from './aiLessons.module.scss';

const CORRECT_ADVANCE_DELAY_MS = 700;
// Must cover the question-exit animation duration in aiLessons.module.scss.
const EXIT_TRANSITION_MS = 220;

interface QuestionFlowProps {
  step: QuestionsStep;
  // Previously recorded answers, used to prefill (re-visiting a step or
  // a hub shows what was chosen before).
  inputs: StudentInputs;
  // Visited step ids, for check marks on branch options whose target the
  // student has already been to.
  path?: string[];
  onAnswer: (record: AnswerRecord) => void;
  // Called when the step is finished: the last question was answered, or
  // a branch option was chosen (passed through so the resolver sees it).
  onComplete: (selectedOptionId?: string) => void;
}

function answerRecord(
  step: QuestionsStep,
  question: Question,
  fields: Partial<AnswerRecord> & {answer: string},
  previous?: AnswerRecord
): AnswerRecord {
  return {
    questionId: question.id,
    stepId: step.id,
    prompt: question.prompt,
    at: new Date().toISOString(),
    attempts: (previous?.attempts || 0) + 1,
    outcome: 'accepted',
    ...fields,
  };
}

// A key-validated selection is correct when the chosen set is exactly
// the set of options marked correct.
function isCorrectSelection(question: Question, chosen: string[]): boolean {
  const correct = (question.options || [])
    .filter(o => o.correct)
    .map(o => o.id);
  return (
    correct.length > 0 &&
    chosen.length === correct.length &&
    chosen.every(id => correct.includes(id))
  );
}

const QuestionFlow: React.FunctionComponent<QuestionFlowProps> = ({
  step,
  inputs,
  path,
  onAnswer,
  onComplete,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [freeText, setFreeText] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState<
    {kind: 'correct' | 'incorrect'; text: string} | undefined
  >();
  // True while the current question plays its exit animation; the next
  // question mounts when the timer fires.  Interactions are locked so a
  // double-click can't submit into the outgoing question.
  const [exiting, setExiting] = useState(false);
  // Bumped on every wrong answer so the shake animation restarts even
  // when the previous attempt was also wrong (the key remounts the
  // options container).
  const [shakeNonce, setShakeNonce] = useState(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>();
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>();

  const question = step.questions[qIndex];
  const isLast = qIndex >= step.questions.length - 1;
  const visited = new Set(path || []);
  // Lock inputs while a correct-answer beat or an exit animation plays.
  const locked = exiting || feedback?.kind === 'correct';

  // Prefill the controls from the recorded answer whenever the active
  // question changes.
  useEffect(() => {
    const previous = question ? inputs[question.id] : undefined;
    setFreeText(previous?.optionId ? '' : previous?.answer || '');
    setSelectedIds(
      previous?.optionIds || (previous?.optionId ? [previous.optionId] : [])
    );
    setScaleValue(previous?.value);
    setFeedback(undefined);
    // `inputs` is deliberately not a dependency: prefill happens on
    // question change, not on every answer save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, qIndex]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    []
  );

  // Highest question index the student has reached; the progress dots
  // navigate freely within [0, maxReached].  Advancing past a gated
  // question still requires answering it, since maxReached only grows
  // through submission.
  const [maxReached, setMaxReached] = useState(0);

  // Play the exit animation, then mount the target question (which
  // enters via its own keyed mount animation).
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

  // Record + route one submission.  `branchOptionId` is set when the
  // student clicked an option that carries a goTo.
  const submit = useCallback(
    (fields: Partial<AnswerRecord> & {answer: string}) => {
      if (!question) return;
      const graded =
        question.validation === 'key' && (question.options || []).length > 0;
      const chosen =
        fields.optionIds || (fields.optionId ? [fields.optionId] : []);
      const correct = graded ? isCorrectSelection(question, chosen) : undefined;

      onAnswer(
        answerRecord(
          step,
          question,
          {
            ...fields,
            outcome: graded ? (correct ? 'correct' : 'incorrect') : 'accepted',
          },
          inputs[question.id]
        )
      );

      if (graded && !correct) {
        setFeedback({kind: 'incorrect', text: 'Not quite — try again!'});
        setShakeNonce(n => n + 1);
        return;
      }

      const branchTarget = fields.optionId
        ? (question.options || []).find(o => o.id === fields.optionId)?.goTo
        : undefined;
      if (branchTarget) {
        onComplete(fields.optionId);
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
    },
    [step, question, inputs, onAnswer, onComplete, goToNextQuestion]
  );

  if (!question) {
    // A questions step with no questions — nothing to collect.
    return (
      <div className={styles.questionFlow}>
        <h2>{step.title}</h2>
        <button
          type="button"
          className={styles.questionSubmit}
          onClick={() => onComplete()}
        >
          Continue →
        </button>
      </div>
    );
  }

  const labelsOf = (ids: string[]) =>
    (question.options || [])
      .filter(o => ids.includes(o.id))
      .map(o => o.label)
      .join('; ');

  // Selected options get a verdict tint once graded feedback exists.
  const optionClass = (optionId: string): string => {
    const classes: string[] = [];
    if (selectedIds.includes(optionId)) {
      classes.push(styles.questionOptionSelected);
      if (feedback) {
        classes.push(
          feedback.kind === 'correct'
            ? styles.questionOptionCorrect
            : styles.questionOptionWrong
        );
      }
    }
    return classes.join(' ');
  };

  const optionsClass = `${styles.questionOptions}${
    feedback?.kind === 'incorrect' ? ` ${styles.optionsShake}` : ''
  }`;

  const renderMultipleChoice = () => {
    if (question.multiSelect) {
      return (
        <>
          <div className={optionsClass} key={shakeNonce}>
            {(question.options || []).map(o => {
              const selected = selectedIds.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  className={optionClass(o.id)}
                  aria-pressed={selected}
                  disabled={locked}
                  onClick={() => {
                    setSelectedIds(ids =>
                      selected ? ids.filter(id => id !== o.id) : [...ids, o.id]
                    );
                    // A changed selection resets any try-again feedback.
                    setFeedback(undefined);
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={styles.questionSubmit}
            disabled={selectedIds.length === 0 || locked}
            onClick={() =>
              submit({answer: labelsOf(selectedIds), optionIds: selectedIds})
            }
          >
            {isLast ? 'Finish →' : 'Next →'}
          </button>
        </>
      );
    }
    // Single select: clicking selects, the button below submits — same
    // rhythm as every other question type, and it gives a revisited
    // question (previous answer pre-selected) an obvious way onward.
    return (
      <>
        <div className={optionsClass} key={shakeNonce}>
          {(question.options || []).map(o => (
            <button
              key={o.id}
              type="button"
              className={optionClass(o.id)}
              aria-pressed={selectedIds.includes(o.id)}
              disabled={locked}
              onClick={() => {
                setSelectedIds([o.id]);
                // A new selection resets any try-again feedback.
                setFeedback(undefined);
              }}
            >
              {o.label}
              {o.goTo && visited.has(o.goTo) ? ' ✓' : ''}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.questionSubmit}
          disabled={selectedIds.length === 0 || locked}
          onClick={() => {
            const chosen = (question.options || []).find(
              o => o.id === selectedIds[0]
            );
            if (chosen) submit({answer: chosen.label, optionId: chosen.id});
          }}
        >
          {isLast ? 'Finish →' : 'Next →'}
        </button>
      </>
    );
  };

  const renderScale = () => {
    const scale = question.scale || {min: 0, max: 10};
    const value = scaleValue ?? Math.round((scale.min + scale.max) / 2);
    return (
      <>
        <div className={styles.questionScale}>
          <span className={styles.questionScaleLabel}>
            {scale.minLabel || scale.min}
          </span>
          <input
            type="range"
            min={scale.min}
            max={scale.max}
            value={value}
            aria-label={question.prompt}
            onChange={e => setScaleValue(Number(e.target.value))}
          />
          <span className={styles.questionScaleLabel}>
            {scale.maxLabel || scale.max}
          </span>
        </div>
        <div className={styles.questionScaleValue}>{value}</div>
        <button
          type="button"
          className={styles.questionSubmit}
          disabled={locked}
          onClick={() => submit({answer: String(value), value})}
        >
          {isLast ? 'Finish →' : 'Next →'}
        </button>
      </>
    );
  };

  const renderFreeResponse = () => (
    <>
      <textarea
        className={styles.questionTextarea}
        value={freeText}
        placeholder={question.placeholder || 'Type your answer…'}
        rows={4}
        onChange={e => setFreeText(e.target.value)}
      />
      <button
        type="button"
        className={styles.questionSubmit}
        disabled={freeText.trim() === '' || locked}
        onClick={() => submit({answer: freeText.trim()})}
      >
        {isLast ? 'Finish →' : 'Next →'}
      </button>
    </>
  );

  return (
    <div className={styles.questionFlow}>
      {step.questions.length > 1 && (
        <div className={styles.questionProgress}>
          {/* The dots double as navigation: any question the student
              has already reached is one click away.  Unreached dots
              stay disabled so gated questions can't be skipped. */}
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
      {/* Keyed by question id so each question mounts fresh and plays
          the entrance animation; the exit class plays it out first. */}
      <div
        key={question.id}
        className={`${styles.questionCard} ${
          exiting ? styles.questionExit : styles.questionEnter
        }`}
      >
        <h2 className={styles.questionPrompt}>{question.prompt}</h2>
        {question.type === 'multipleChoice' && renderMultipleChoice()}
        {question.type === 'scale' && renderScale()}
        {question.type === 'freeResponse' && renderFreeResponse()}
        {feedback && (
          <div
            className={
              feedback.kind === 'correct'
                ? styles.questionFeedbackCorrect
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
