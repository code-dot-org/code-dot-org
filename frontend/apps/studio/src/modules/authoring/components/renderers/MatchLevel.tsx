import {Button, Typography} from '@mui/material';
import {useMemo, useState} from 'react';

import type {GenericLevelData} from '@code-dot-org/authoring';
import {Markdown} from '@code-dot-org/markdown';

import styles from '../authoring.module.scss';

type MatchData = Extract<GenericLevelData, {type: 'match'}>;

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Matching projection: one native <select> per prompt, options drawn from
 * the shuffled answer pool. No drag-and-drop — a select is the simplest
 * control that stays keyboard- and screen-reader-usable.
 */
export default function MatchLevel({
  data,
  onAnswer,
}: {
  data: MatchData;
  onAnswer: (data: unknown) => void;
}) {
  const [selections, setSelections] = useState<(string | undefined)[]>(() =>
    data.pairs.map(() => undefined),
  );
  const [graded, setGraded] = useState<boolean[] | null>(null);

  // Shuffled once per mount, not on every render, so the answer order
  // doesn't jump around while the learner is picking.
  const answerPool = useMemo(() => shuffled(data.pairs.map(p => p.answer)), []);

  function handleSelect(i: number, value: string) {
    setSelections(prev => prev.map((v, idx) => (idx === i ? value : v)));
    setGraded(null);
  }

  function handleSubmit() {
    const results = data.pairs.map((pair, i) => selections[i] === pair.answer);
    const correctCount = results.filter(Boolean).length;
    setGraded(results);
    onAnswer({
      type: 'match_answer',
      correct: correctCount === data.pairs.length,
      correctCount,
      total: data.pairs.length,
    });
  }

  return (
    <div>
      {data.markdown && <Markdown>{data.markdown}</Markdown>}
      <div className={styles.answerList}>
        {data.pairs.map((pair, i) => {
          const classes = [styles.answerOption];
          if (graded) {
            classes.push(
              graded[i] ? styles.answerOptionCorrect : styles.answerOptionWrong,
            );
          }
          return (
            <div key={i} className={classes.join(' ')}>
              <Typography variant="body1">{pair.question}</Typography>
              <select
                aria-label={pair.question}
                value={selections[i] ?? ''}
                onChange={e => handleSelect(i, e.target.value)}
              >
                <option value="" disabled>
                  Choose an answer
                </option>
                {answerPool.map(answer => (
                  <option key={answer} value={answer}>
                    {answer}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 12}}>
        <Button
          variant="contained"
          size="small"
          disabled={selections.some(v => !v)}
          onClick={handleSubmit}
        >
          Check
        </Button>
      </div>
      {graded && (
        <Typography variant="body2">
          {graded.filter(Boolean).length}/{data.pairs.length} correct
        </Typography>
      )}
    </div>
  );
}
