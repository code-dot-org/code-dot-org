import {Button, Typography} from '@mui/material';
import {useMemo, useState} from 'react';

import type {GenericLevelData} from '@code-dot-org/authoring';
import RadioButton from '@code-dot-org/component-library/radioButton';
import {Markdown} from '@code-dot-org/markdown';

import styles from '../authoring.module.scss';

type MatchData = Extract<GenericLevelData, {type: 'match'}>;

// Accessible-name fallback for a markdown answer: an image contributes its
// alt text, everything else is stripped to its visible text. Regex-based,
// not a markdown parse — the accname only needs to read sanely, not
// round-trip every CommonMark construct.
export function stripMarkdownToText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*\*|\*\*|\*|___|__|_|`)/g, '')
    .trim();
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Matching projection: one radio group per prompt, options drawn from the
 * shuffled answer pool. Used to be a native <select>, but an <option> can
 * only show its text content — markdown in an answer (an image, `code`,
 * **bold**) came through as literal source. A radio group keeps the
 * keyboard/screen-reader affordances of a select while letting each choice
 * render through Markdown. No drag-and-drop — out of scope for this
 * projection.
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
              <Markdown>{pair.question}</Markdown>
              <div
                role="radiogroup"
                aria-label={pair.question}
                className={styles.matchAnswerChoices}
              >
                {answerPool.map(answer => (
                  <RadioButton
                    key={answer}
                    name={`match-${i}`}
                    value={answer}
                    checked={selections[i] === answer}
                    onChange={() => handleSelect(i, answer)}
                    // Falls back to the raw markdown when stripping yields
                    // nothing (e.g. an image with no alt text — the live
                    // all-image level has this) — RadioButton treats a falsy
                    // ariaLabel as "no override" and renders no aria-label at
                    // all, which is a harder accessibility failure (no name)
                    // than the pre-fix raw-markdown announcement it had
                    // before.
                    ariaLabel={stripMarkdownToText(answer) || answer}
                    className={styles.answerOption}
                  >
                    <Markdown>{answer}</Markdown>
                  </RadioButton>
                ))}
              </div>
              {graded && (
                <span className={styles.visuallyHidden}>
                  {graded[i] ? 'Correct' : 'Incorrect'}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.checkRow}>
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
        <Typography variant="body2" role="status" aria-live="polite">
          {graded.filter(Boolean).length}/{data.pairs.length} correct
        </Typography>
      )}
    </div>
  );
}
