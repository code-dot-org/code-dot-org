import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {MatchPairs, MatchSets, MatchSide} from './types';
import {findPartner, itemsInColumn, letterOf, getItemText} from './utils';

import styles from './match-question-container.module.scss';

interface MatchColumnProps {
  matchSets: MatchSets;
  side: MatchSide;
  pairs: MatchPairs;
  selectedId: string | undefined;
  // Omit for read-only cards, which aren't buttons.
  onClickItem?: (id: string) => void;
  // Receives each item's dot, which MatchBoard draws lines to.
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
      const className = classNames(styles.card, side === 'end' && styles.end, {
        [styles.cardActive]: partnerId || isSelected,
      });
      const content = (
        <>
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
        </>
      );
      // A plain element can't reliably carry aria-label, so a read-only card
      // states its partner in hidden text instead.
      if (!onClickItem) {
        return (
          <div key={item.id} className={className}>
            {content}
            <span className={styles.srOnly}>
              {partnerId
                ? `, matched with ${getItemText(matchSets, partnerId)}`
                : ', not matched'}
            </span>
          </div>
        );
      }
      return (
        <button
          key={item.id}
          type="button"
          className={className}
          aria-pressed={isSelected}
          aria-label={
            partnerId
              ? `${getItemText(matchSets, item.id)}, matched with ${getItemText(
                  matchSets,
                  partnerId
                )}`
              : getItemText(matchSets, item.id)
          }
          onClick={() => onClickItem(item.id)}
          disabled={disabled}
        >
          {content}
        </button>
      );
    })}
  </div>
);

export default MatchColumn;
