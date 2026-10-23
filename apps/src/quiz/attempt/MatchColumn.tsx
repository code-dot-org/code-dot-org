import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {
  labelOf,
  letterOf,
  MatchPairs,
  MatchSets,
  partnerOf,
} from './matchPairing';

import styles from './match-question-container.module.scss';

interface MatchColumnProps {
  matchSets: MatchSets;
  set: 0 | 1;
  pairs: MatchPairs;
  selectedId: string | undefined;
  onClickItem: (id: string) => void;
  // Receives each item's dot, which MatchQuestionContainer draws lines to.
  dotRef: (id: string, element: HTMLElement | null) => void;
  disabled?: boolean;
}

const MatchColumn: React.FunctionComponent<MatchColumnProps> = ({
  matchSets,
  set,
  pairs,
  selectedId,
  onClickItem,
  dotRef,
  disabled,
}) => (
  <div className={styles.column}>
    {matchSets[set].map(item => {
      const partnerId = partnerOf(pairs, item.id);
      const isSelected = selectedId === item.id;
      // A second-set item shows its partner's letter once paired.
      const letter =
        set === 0
          ? letterOf(matchSets, item.id)
          : partnerId && letterOf(matchSets, partnerId);
      return (
        <button
          key={item.id}
          type="button"
          className={classNames(styles.card, set === 1 && styles.second, {
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
            variant={set === 0 ? 'body2' : 'body3'}
            component="span"
            className={classNames(set === 0 && styles.firstText)}
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
