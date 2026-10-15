/* Shows the dataset one row at a time on a stack of cards, with a pager to
 * step through the rows. Cards behind the current one are blank and peek out
 * above it. */
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {type CSSProperties, type KeyboardEvent} from 'react';

import {useAppDispatch, useAppSelector} from '../hooks';
import {setDatasetCardRow} from '../redux';

import DatasetRowCard from './DatasetRowCard';
import PagerButton from './PagerButton';

import styles from './datasetRowCards.module.scss';

// Blank cards visible behind the current one.
const DECK_PEEK = 2;

const DatasetRowCards = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => state.data);
  const rowIndex = useAppSelector(state => state.datasetCardRow);
  const total = data.length;

  // Render the previous card so it can animate away, and one card past the
  // peeking ones so it can fade in.
  const windowStart = Math.max(0, rowIndex - 1);
  const windowEnd = Math.min(total, rowIndex + DECK_PEEK + 2);

  const goToRow = (index: number) =>
    dispatch(setDatasetCardRow(Math.min(Math.max(index, 0), total - 1)));

  const onKeyDown = (event: KeyboardEvent) => {
    const targetRow = {
      ArrowRight: rowIndex + 1,
      ArrowDown: rowIndex + 1,
      ArrowLeft: rowIndex - 1,
      ArrowUp: rowIndex - 1,
      Home: 0,
      End: total - 1,
    }[event.key];
    if (targetRow !== undefined) {
      event.preventDefault();
      goToRow(targetRow);
    }
  };

  return (
    <div
      className={styles.root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Dataset rows"
    >
      <div className={styles.stage}>
        <div className={styles.deck}>
          {data.slice(windowStart, windowEnd).map((row, offset) => {
            const datasetRow = windowStart + offset;
            const depth = datasetRow - rowIndex;
            return (
              <div
                key={datasetRow}
                className={classNames(styles.slot, {
                  [styles.dealt]: depth < 0,
                  [styles.waiting]: depth > DECK_PEEK,
                })}
                style={{'--deck-depth': Math.max(0, depth)} as CSSProperties}
                aria-hidden={depth === 0 ? undefined : true}
              >
                {depth > 0 ? (
                  <div className={styles.ghost} />
                ) : (
                  <DatasetRowCard
                    front={depth === 0}
                    rowNumber={datasetRow + 1}
                    row={row}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <nav className={styles.pager} aria-label="Card navigation">
        <PagerButton
          label="Previous row"
          icon="chevron-left"
          disabled={rowIndex === 0}
          onClick={() => goToRow(rowIndex - 1)}
          onKeyDown={onKeyDown}
        />
        <Typography
          component="span"
          variant="body3"
          className={styles.counter}
          aria-live="polite"
        >
          {`Row ${rowIndex + 1} of ${total}`}
        </Typography>
        <PagerButton
          label="Next row"
          icon="chevron-right"
          disabled={rowIndex === total - 1}
          onClick={() => goToRow(rowIndex + 1)}
          onKeyDown={onKeyDown}
        />
      </nav>
    </div>
  );
};

export default DatasetRowCards;
