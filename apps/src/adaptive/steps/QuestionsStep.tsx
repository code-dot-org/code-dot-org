import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {Step} from '../types';

import moduleStyles from '../pathway.module.scss';

type QuestionsStepContent = Extract<Step, {kind: 'questions'}>;
type TopQuestion = QuestionsStepContent['questions'][number];
type Branch = NonNullable<
  Extract<TopQuestion, {type: 'multipleChoice'}>['branches']
>[number];
type Question = TopQuestion | NonNullable<Branch['questions']>[number];

export type Answers = {[questionId: string]: string};

type Page =
  | {kind: 'question'; question: Question; followUp: boolean}
  | {kind: 'message'; id: string; text: string};

function matchBranch(
  question: TopQuestion,
  answer: string | undefined
): Branch | undefined {
  if (question.type !== 'multipleChoice' || !answer) return undefined;
  return question.branches?.find(b => b.optionIds.includes(answer));
}

/** The pages to show given the answers so far. Changes as answers change. */
function buildPages(step: QuestionsStepContent, answers: Answers): Page[] {
  const pages: Page[] = [];
  for (const question of step.questions) {
    pages.push({kind: 'question', question, followUp: false});
    const branch = matchBranch(question, answers[question.id]);
    if (!branch) continue;
    if (branch.message) {
      pages.push({
        kind: 'message',
        id: `${question.id}-message`,
        text: branch.message,
      });
    }
    for (const followUp of branch.questions || []) {
      pages.push({kind: 'question', question: followUp, followUp: true});
    }
  }
  return pages;
}

/** Checkpoints whose branch follow-ups were all answered correctly. */
export function completedByAnswers(
  step: QuestionsStepContent,
  answers: Answers
): string[] {
  const out: string[] = [];
  for (const question of step.questions) {
    const branch = matchBranch(question, answers[question.id]);
    if (!branch?.completes || !branch.questions?.length) continue;
    const allCorrect = branch.questions.every(
      f =>
        f.type !== 'multipleChoice' ||
        f.options.some(o => o.correct && o.id === answers[f.id])
    );
    if (allCorrect) out.push(branch.completes);
  }
  return out;
}

interface QuestionsStepProps {
  step: QuestionsStepContent;
  initialAnswers?: Answers;
  continueLabel: string;
  onComplete: (answers: Answers) => void;
}

const QuestionsStep: React.FunctionComponent<QuestionsStepProps> = ({
  step,
  initialAnswers,
  continueLabel,
  onComplete,
}) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers || {});
  const pages = buildPages(step, answers);
  const page = pages[Math.min(index, pages.length - 1)];
  const last = index >= pages.length - 1;
  const answered =
    page.kind === 'message' || (answers[page.question.id] || '').trim() !== '';
  const answer = (id: string, value: string) =>
    setAnswers(a => ({...a, [id]: value}));

  const renderInput = (question: Question) => {
    switch (question.type) {
      case 'multipleChoice':
        return (
          <div className={moduleStyles.options} role="group">
            {question.options.map(option => (
              <button
                key={option.id}
                type="button"
                className={classNames(
                  moduleStyles.option,
                  answers[question.id] === option.id &&
                    moduleStyles.optionSelected
                )}
                aria-pressed={answers[question.id] === option.id}
                onClick={() => answer(question.id, option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        );
      case 'freeResponse':
        return (
          <textarea
            className={moduleStyles.textArea}
            placeholder={question.placeholder}
            aria-label={question.prompt}
            value={answers[question.id] || ''}
            onChange={e => answer(question.id, e.target.value)}
          />
        );
      case 'scale': {
        const {min, max, minLabel, maxLabel} = question.scale;
        const values = Array.from({length: max - min + 1}, (_, i) => min + i);
        return (
          <div className={moduleStyles.options} role="group">
            {values.map(v => (
              <button
                key={v}
                type="button"
                className={classNames(
                  moduleStyles.option,
                  answers[question.id] === String(v) &&
                    moduleStyles.optionSelected
                )}
                aria-pressed={answers[question.id] === String(v)}
                onClick={() => answer(question.id, String(v))}
              >
                {v}
                {v === min && minLabel ? ` ${minLabel}` : ''}
                {v === max && maxLabel ? ` ${maxLabel}` : ''}
              </button>
            ))}
          </div>
        );
      }
    }
  };

  const overline =
    index === 0 && step.description
      ? step.description
      : page.kind === 'question' && page.followUp
      ? 'Quick check'
      : undefined;

  return (
    <div className={moduleStyles.panels}>
      {page.kind === 'message' ? (
        <div className={moduleStyles.panelCard}>
          <MuiTypography variant="h3">{page.text}</MuiTypography>
        </div>
      ) : (
        <div className={moduleStyles.questionCard}>
          {overline && (
            <MuiTypography variant="overline3" className={moduleStyles.muted}>
              {overline}
            </MuiTypography>
          )}
          <MuiTypography variant="h4">{page.question.prompt}</MuiTypography>
          {renderInput(page.question)}
        </div>
      )}
      <div className={moduleStyles.panelNav}>
        <MuiButton
          variant="outlined"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </MuiButton>
        <MuiButton
          variant="contained"
          disabled={!answered}
          onClick={() => (last ? onComplete(answers) : setIndex(index + 1))}
        >
          {last ? continueLabel : 'Next'}
        </MuiButton>
      </div>
    </div>
  );
};

export default QuestionsStep;
