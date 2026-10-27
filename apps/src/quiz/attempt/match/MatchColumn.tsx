import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {MatchPairs, MatchSets, MatchSide} from './types';
import {findPartner, itemsInColumn, labelOf, letterOf} from './utils';

import styles from './match-question-container.module.scss';

interface MatchColumnProps {
  matchSets: MatchSets;
  side: MatchSide;
  pairs: MatchPairs;
  selectedId: string | undefined;
  onClickItem: (id: string) => void;
  // Receives each item's dot, which MatchQuestionContainer draws lines to.
  dotRef: (id: string, element: HTMLElement | null) => void;
  disabled?: boolean;
}

const MatchColumn: React.FunctionComponent<MatchColumnProps> = ({
  matchSets,
  side,
  pairs,
  selectedId,
  onClickItem,
  dotRef,
  disabled,
}) => (
  <div className={styles.column}>
    {itemsInColumn(matchSets, side).map(item => {
      const partnerId = findPartner(pairs, item.id);
      const isSelected = selectedId === item.id;
      // An end item shows its partner's letter once paired.
      const letter =
        side === 'start'
          ? letterOf(matchSets, item.id)
          : partnerId && letterOf(matchSets, partnerId);
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
              ? `${labelOf(matchSets, item.id)}, matched with ${labelOf(
                  matchSets,
                  partnerId
                )}`
              : labelOf(matchSets, item.id)
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
