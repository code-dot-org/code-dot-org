import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useId} from 'react';

import AddItemButton from '../AddItemButton';
import {MIN_PAIRS, newMatchPair} from '../matchPairs';
import {
  MatchDraft,
  MatchPair,
  MultipleChoiceDraft,
  QuizQuestionDraft,
} from '../types';

import styles from './quiz-question-card.module.scss';
import builderCommonStyles from '../builder-common.module.scss';

interface AnswersTabProps {
  draft: QuizQuestionDraft;
  onChange: (draft: QuizQuestionDraft) => void;
  disabled?: boolean;
}

// MultipleChoiceQuestion#validate_choices rejects fewer than 2 choices.
const MIN_CHOICES = 2;

function nextChoiceId(existingIds: string[]): string {
  const used = new Set(existingIds);
  let n = 0;
  while (used.has(String(n))) {
    n++;
  }
  return String(n);
}

interface ChoicesEditorProps {
  draft: MultipleChoiceDraft;
  onChange: (draft: MultipleChoiceDraft) => void;
  disabled?: boolean;
}

// Only ever single-correct (radio, not checkbox) - the backend has no way
// to store more than one correctChoiceId yet.
const ChoicesEditor: React.FunctionComponent<ChoicesEditorProps> = ({
  draft,
  onChange,
  disabled,
}) => {
  const updateChoiceText = (id: string, text: string) => {
    onChange({
      ...draft,
      choices: draft.choices.map(choice =>
        choice.id === id ? {...choice, text} : choice
      ),
    });
  };

  const removeChoice = (id: string) => {
    onChange({
      ...draft,
      choices: draft.choices.filter(choice => choice.id !== id),
      correctChoiceId:
        draft.correctChoiceId === id ? null : draft.correctChoiceId,
    });
  };

  const addChoice = () => {
    const id = nextChoiceId(draft.choices.map(choice => choice.id));
    onChange({...draft, choices: [...draft.choices, {id, text: ''}]});
  };

  return (
    <>
      <div className={styles.optionsList}>
        {draft.choices.map(choice => {
          const isCorrect = draft.correctChoiceId === choice.id;
          return (
            <div key={choice.id} className={styles.optionRow}>
              <TextField
                name={`choice-${choice.id}`}
                aria-label="Choice text"
                size="s"
                color="gray"
                className={classNames(styles.fullWidthField, styles.optionText)}
                value={choice.text}
                onChange={e => updateChoiceText(choice.id, e.target.value)}
                disabled={disabled}
              />
              <IconButton
                aria-label="Mark as correct answer"
                aria-pressed={isCorrect}
                size="small"
                className={classNames(styles.correctToggle, {
                  [styles.correctToggleSelected]: isCorrect,
                })}
                type="button"
                disabled={disabled}
                onClick={() => onChange({...draft, correctChoiceId: choice.id})}
              >
                <FontAwesomeV6Icon iconName="check" />
              </IconButton>
              <IconButton
                aria-label="Delete choice"
                size="small"
                color="error"
                type="button"
                disabled={disabled || draft.choices.length <= MIN_CHOICES}
                onClick={() => removeChoice(choice.id)}
              >
                <FontAwesomeV6Icon iconName="trash" />
              </IconButton>
            </div>
          );
        })}
      </div>
      <AddItemButton
        label="Add option"
        onClick={addChoice}
        disabled={disabled}
      />
    </>
  );
};

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
  const headingId = useId();

  const updateItemText = (pairId: string, index: 0 | 1, text: string) => {
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
    <div role="group" aria-labelledby={headingId} className={styles.pairsGroup}>
      <Typography variant="label3" component="span" id={headingId}>
        Options
      </Typography>
      <div className={styles.optionsList}>
        {draft.pairs.map((pair, pairIndex) => (
          <div
            key={pair.id}
            className={classNames(styles.optionRow, styles.pairRow)}
          >
            {pair.items.map((item, index) => {
              const role = index === 0 ? 'Term' : 'Definition';
              return (
                <textarea
                  key={item.id}
                  name={`pair-${pair.id}-item-${index}`}
                  aria-label={`Pair ${pairIndex + 1}, ${role.toLowerCase()}`}
                  placeholder={role}
                  className={classNames(
                    builderCommonStyles.textarea,
                    styles.pairText
                  )}
                  value={item.text}
                  onChange={e =>
                    updateItemText(pair.id, index as 0 | 1, e.target.value)
                  }
                  disabled={disabled}
                />
              );
            })}
            <IconButton
              aria-label={`Delete pair ${pairIndex + 1}`}
              size="small"
              color="error"
              type="button"
              disabled={disabled || draft.pairs.length <= MIN_PAIRS}
              onClick={() => removePair(pair.id)}
            >
              <FontAwesomeV6Icon iconName="trash" />
            </IconButton>
          </div>
        ))}
      </div>
      <AddItemButton
        label="Add pair"
        onClick={() =>
          onChange({...draft, pairs: [...draft.pairs, newMatchPair()]})
        }
        disabled={disabled}
      />
    </div>
  );
};

const AnswersTab: React.FunctionComponent<AnswersTabProps> = ({
  draft,
  onChange,
  disabled,
}) => (
  <div className={builderCommonStyles.section}>
    {draft.type === 'MultipleChoiceQuestion' && (
      <ChoicesEditor draft={draft} onChange={onChange} disabled={disabled} />
    )}
    {draft.type === 'MatchQuestion' && (
      <PairsEditor draft={draft} onChange={onChange} disabled={disabled} />
    )}

    <FormFieldWrapper label="Answer explanation (optional)">
      <textarea
        className={builderCommonStyles.textarea}
        name="explanation"
        rows={4}
        value={draft.explanation ?? ''}
        onChange={e => onChange({...draft, explanation: e.target.value})}
        disabled={disabled}
      />
    </FormFieldWrapper>
  </div>
);

export default AnswersTab;
