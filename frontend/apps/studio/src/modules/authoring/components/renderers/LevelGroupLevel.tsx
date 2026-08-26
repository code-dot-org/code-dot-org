import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import type {GenericLevelData} from '@code-dot-org/authoring';
import {Markdown} from '@code-dot-org/markdown';

import MultiLevel from './MultiLevel';

import styles from '../authoring.module.scss';

type LevelGroupData = Extract<GenericLevelData, {type: 'levelGroup'}>;

/**
 * LevelGroup projection: a paged sequence of sub-levels. Only 'multi' and
 * 'markdown' sub-levels are interactive here — anything else falls back to a
 * one-line label naming the real type, same honesty policy as
 * UnsupportedLevel.
 */
export default function LevelGroupLevel({
  data,
  onAnswer,
}: {
  data: LevelGroupData;
  onAnswer: (data: unknown) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = data.pages[pageIndex];

  return (
    <div>
      {data.title && <Typography variant="h5">{data.title}</Typography>}
      {page?.levels.map(level => {
        switch (level.data.type) {
          case 'multi':
            return (
              <MultiLevel
                key={level.levelKey}
                data={level.data}
                onAnswer={onAnswer}
              />
            );
          case 'markdown':
            return (
              <Markdown key={level.levelKey}>{level.data.markdown}</Markdown>
            );
          default:
            return (
              <Typography key={level.levelKey} variant="body2">
                Unsupported nested level type ({level.data.type}) —{' '}
                {level.levelKey}
              </Typography>
            );
        }
      })}
      <div className={styles.stageNav}>
        <Button
          variant="contained"
          size="small"
          disabled={pageIndex === 0}
          onClick={() => setPageIndex(i => i - 1)}
        >
          Back
        </Button>
        <Typography variant="body2">
          {data.pages.length === 0
            ? 'No pages'
            : `Page ${pageIndex + 1} of ${data.pages.length}`}
        </Typography>
        <Button
          variant="contained"
          size="small"
          disabled={pageIndex >= data.pages.length - 1}
          onClick={() => setPageIndex(i => i + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
