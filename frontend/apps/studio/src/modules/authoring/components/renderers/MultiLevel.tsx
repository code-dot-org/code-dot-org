import {Button, Typography} from '@mui/material';
import {useMemo, useState} from 'react';

import type {GenericLevelData} from '@code-dot-org/authoring';
import {Markdown} from '@code-dot-org/markdown';

import styles from '../authoring.module.scss';

type MultiData = Extract<GenericLevelData, {type: 'multi'}>;

function sameSet(indices: number[], selected: Set<number>): boolean {
  return (
    indices.length === selected.size && indices.every(i => selected.has(i))
  );
}

/**
 * MultipleChoice projection. Checkbox semantics kick in once more than one
 * answer is authored correct; otherwise it's single-select. A wrong grade
 * with allowMultipleAttempts re-opens selection immediately — no extra click
 * needed to "unlock" it.
 */
export default function MultiLevel({
  data,
  onAnswer,
}: {
  data: MultiData;
  onAnswer: (data: unknown) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [graded, setGraded] = useState(false);
  const [correct, setCorrect] = useState(false);

  const correctIndices = useMemo(
    () =>
      data.answers.reduce<number[]>(
        (acc, answer, i) => (answer.correct ? [...acc, i] : acc),
        [],
      ),
    [data.answers],
  );
  const multiSelect = correctIndices.length > 1;
  const locked = graded && !(data.allowMultipleAttempts && !correct);

  function toggleSelect(i: number) {
    if (locked) return;
    setGraded(false);
    setSelected(prev => {
      if (!multiSelect) return [i];
      return prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
    });
  }

  function handleSubmit() {
    const isCorrect = sameSet(correctIndices, new Set(selected));
    setGraded(true);
    setCorrect(isCorrect);
    onAnswer({
      type: 'multi_answer',
      question: data.question,
      selected,
      correct: isCorrect,
    });
  }

  return (
    <div>
      {data.markdown && <Markdown>{data.markdown}</Markdown>}
      <Typography variant="h5">{data.question}</Typography>
      <div className={styles.answerList}>
        {data.answers.map((answer, i) => {
          const isSelected = selected.includes(i);
          const classes = [styles.answerOption];
          if (graded && answer.correct) {
            classes.push(styles.answerOptionCorrect);
          } else if (graded && isSelected) {
            classes.push(styles.answerOptionWrong);
          } else if (isSelected) {
            classes.push(styles.answerOptionSelected);
          }
          return (
            <button
              key={i}
              type="button"
              className={classes.join(' ')}
              disabled={locked}
              onClick={() => toggleSelect(i)}
            >
              {answer.text}
              {graded && answer.correct && (
                <span className={styles.visuallyHidden}> (Correct)</span>
              )}
              {graded && !answer.correct && isSelected && (
                <span className={styles.visuallyHidden}> (Incorrect)</span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{marginTop: 12}}>
        <Button
          variant="contained"
          size="small"
          disabled={selected.length === 0 || (graded && correct)}
          onClick={handleSubmit}
        >
          Check
        </Button>
      </div>
      {graded && (
        <Typography variant="body2" role="status" aria-live="polite">
          {correct
            ? 'Correct!'
            : data.allowMultipleAttempts
              ? 'Not quite — try again.'
              : 'Not quite.'}
        </Typography>
      )}
    </div>
  );
}
