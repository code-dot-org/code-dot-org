import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {IconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import AddItemButton from '../AddItemButton';
import {MultipleChoiceDraft, QuizQuestionDraft} from '../types';

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

const AnswersTab: React.FunctionComponent<AnswersTabProps> = ({
  draft,
  onChange,
  disabled,
}) => (
  <div className={builderCommonStyles.section}>
    {draft.type === 'MultipleChoiceQuestion' && (
      <ChoicesEditor draft={draft} onChange={onChange} disabled={disabled} />
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
