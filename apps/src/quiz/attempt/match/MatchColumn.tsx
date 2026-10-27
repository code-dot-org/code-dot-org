import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {MatchItems, MatchPairs, MatchSide} from './types';
import {findPartner, itemsInColumn, letterOf, getItemText} from './utils';

import styles from './match-question-container.module.scss';

interface MatchColumnProps {
  items: MatchItems;
  side: MatchSide;
  pairs: MatchPairs;
  selectedId: string | undefined;
  onClickItem: (id: string) => void;
  // Receives each item's dot, which MatchQuestionContainer draws lines to.
  dotRef: (id: string, element: HTMLElement | null) => void;
  disabled?: boolean;
}

const MatchColumn: React.FunctionComponent<MatchColumnProps> = ({
  items,
  side,
  pairs,
  selectedId,
  onClickItem,
  dotRef,
  disabled,
}) => (
  <div className={styles.column}>
    {itemsInColumn(items, side).map(item => {
      const partnerId = findPartner(pairs, item.id);
      const isSelected = selectedId === item.id;
      // An end item shows its partner's letter once paired.
      const letter =
        side === 'start'
          ? letterOf(items, item.id)
          : partnerId && letterOf(items, partnerId);
      return (
        <button
          key={item.id}
          type="button"
          className={classNames(styles.card, side === 'end' && styles.end, {
            [styles.cardActive]: partnerId || isSelected,
          })}
          aria-pressed={isSelected}
          aria-label={
            partnerId
              ? `${getItemText(items, item.id)}, matched with ${getItemText(
                  items,
                  partnerId
                )}`
              : getItemText(items, item.id)
          }
          onClick={() => onClickItem(item.id)}
          disabled={disabled}
        >
          <Typography
            variant={side === 'start' ? 'body2' : 'body3'}
            component="span"
            className={classNames(side === 'start' && styles.startText)}
          >
            {item.text}
          </Typography>
          <span
            ref={element => dotRef(item.id, element)}
            className={styles.dot}
            aria-hidden="true"
          >
            {letter}
          </span>
        </button>
      );
    })}
  </div>
);

export default MatchColumn;
