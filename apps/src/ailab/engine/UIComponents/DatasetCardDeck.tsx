/* Shows the given dataset rows one at a time on a stack of cards, with a
 * pager to step through them. Cards behind the current one are blank and peek
 * out above it. */
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {type CSSProperties, type KeyboardEvent} from 'react';

import {useAppDispatch, useAppSelector} from '../hooks';
import {setDatasetCardRow} from '../redux';

import DatasetRowCard from './DatasetRowCard';
import PagerButton from './PagerButton';

import styles from './datasetCardDeck.module.scss';

// Blank cards visible behind the current one.
const DECK_PEEK = 2;

interface DatasetCardDeckProps {
  rows: number[];
}

const DatasetCardDeck = ({rows}: DatasetCardDeckProps) => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => state.data);
  const currentRow = useAppSelector(state => state.datasetCardRow);
  const total = rows.length;
  // A filter that drops the current row moves the deck to its first card.
  const position = Math.max(rows.indexOf(currentRow), 0);

  // Render the previous card so it can animate away, and one card past the
  // peeking ones so it can fade in.
  const windowStart = Math.max(0, position - 1);
  const windowEnd = Math.min(total, position + DECK_PEEK + 2);

  const goToCard = (index: number) =>
    dispatch(setDatasetCardRow(rows[Math.min(Math.max(index, 0), total - 1)]));

  const onKeyDown = (event: KeyboardEvent) => {
    const targetCard = {
      ArrowRight: position + 1,
      ArrowDown: position + 1,
      ArrowLeft: position - 1,
      ArrowUp: position - 1,
      Home: 0,
      End: total - 1,
    }[event.key];
    if (targetCard !== undefined) {
      event.preventDefault();
      goToCard(targetCard);
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
          {rows.slice(windowStart, windowEnd).map((row, offset) => {
            const depth = windowStart + offset - position;
            return (
              <div
                key={row}
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
                    isCurrent={depth === 0}
                    rowNumber={row + 1}
                    row={data[row]}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <nav className={styles.pager} aria-label="Card navigation">
        <PagerButton
          label="Previous card"
          icon="chevron-left"
          disabled={position === 0}
          onClick={() => goToCard(position - 1)}
          onKeyDown={onKeyDown}
        />
        <Typography
          component="span"
          variant="body3"
          className={styles.counter}
          aria-live="polite"
        >
          {`Card ${position + 1} of ${total}`}
        </Typography>
        <PagerButton
          label="Next card"
          icon="chevron-right"
          disabled={position === total - 1}
          onClick={() => goToCard(position + 1)}
          onKeyDown={onKeyDown}
        />
      </nav>
    </div>
  );
};

export default DatasetCardDeck;
