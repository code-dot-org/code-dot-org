import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import AddItemButton from '../AddItemButton';
import {MIN_PAIRS, newMatchPair} from '../matchPairs';
import {MatchDraft, MatchPair} from '../types';

import FieldGroup from './FieldGroup';

import styles from './quiz-question-card.module.scss';
import builderCommonStyles from '../builder-common.module.scss';

interface PairsEditorProps {
  draft: MatchDraft;
  onChange: (draft: MatchDraft) => void;
  disabled?: boolean;
}

const PairsEditor: React.FunctionComponent<PairsEditorProps> = ({
  draft,
  onChange,
  disabled,
}) => {
  const updateItemText = (pairId: string, index: number, text: string) => {
    onChange({
      ...draft,
      pairs: draft.pairs.map(pair => {
        if (pair.id !== pairId) {
          return pair;
        }
        const items: MatchPair['items'] = [...pair.items];
        items[index] = {...items[index], text};
        return {...pair, items};
      }),
    });
  };

  const removePair = (pairId: string) => {
    onChange({
      ...draft,
      pairs: draft.pairs.filter(pair => pair.id !== pairId),
    });
  };

  return (
    <FieldGroup label="Options" className={styles.optionsField}>
      <div className={styles.optionsList}>
        {draft.pairs.map((pair, pairIndex) => (
          <div
            key={pair.id}
            className={classNames(styles.optionRow, styles.pairRow)}
          >
            {pair.items.map((item, itemIndex) => {
              const role = itemIndex === 0 ? 'Term' : 'Definition';
              return (
                <textarea
                  key={item.id}
                  name={`pair-${pair.id}-item-${itemIndex}`}
                  aria-label={`Pair ${pairIndex + 1}, ${role.toLowerCase()}`}
                  placeholder={role}
                  className={classNames(
                    builderCommonStyles.textarea,
                    styles.pairText
                  )}
                  value={item.text}
                  onChange={e =>
                    updateItemText(pair.id, itemIndex, e.target.value)
                  }
                  disabled={disabled}
                />
              );
            })}
            <IconButton
              aria-label={`Delete pair ${pairIndex + 1}`}
              size="small"
              variant="text"
              color="error"
              type="button"
              disabled={disabled || draft.pairs.length <= MIN_PAIRS}
              onClick={e => {
                const row = e.currentTarget.parentElement;
                const next = row?.nextElementSibling;
                const prev = row?.previousElementSibling;
                (
                  next?.querySelector<HTMLTextAreaElement>('textarea') ??
                  prev?.querySelector<HTMLTextAreaElement>('textarea')
                )?.focus();
                removePair(pair.id);
              }}
            >
              <FontAwesomeV6Icon iconName="trash" />
            </IconButton>
          </div>
        ))}
        <AddItemButton
          label="Add pair"
          onClick={() =>
            onChange({...draft, pairs: [...draft.pairs, newMatchPair()]})
          }
          disabled={disabled}
        />
      </div>
    </FieldGroup>
  );
};

export default PairsEditor;
