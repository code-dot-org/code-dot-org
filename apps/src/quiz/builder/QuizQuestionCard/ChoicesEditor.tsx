import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import {IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useId} from 'react';

import AddItemButton from '../AddItemButton';
import {QUESTION_TYPE_LABELS_ICONS} from '../constants';
import {ChoiceQuestionDraft, isMultipleSelectDraft} from '../types';

import styles from './quiz-question-card.module.scss';

// ChoiceQuestion#validate_choices rejects fewer than 2 choices.
const MIN_CHOICES = 2;

const CHOICE_TYPES: ChoiceQuestionDraft['type'][] = [
  'MultipleChoiceQuestion',
  'MultipleSelectQuestion',
];

function nextChoiceId(existingIds: string[]): string {
  const used = new Set(existingIds);
  let n = 0;
  while (used.has(String(n))) {
    n++;
  }
  return String(n);
}

// Labels a group of controls; each control keeps its own accessible name.
const FieldGroup: React.FunctionComponent<{
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({label, className, children}) => (
  <fieldset className={classNames(styles.fieldGroup, className)}>
    <legend className={styles.fieldGroupLabel}>
      <Typography variant="label3" component="span">
        {label}
      </Typography>
    </legend>
    {children}
  </fieldset>
);

interface ChoicesEditorProps {
  draft: ChoiceQuestionDraft;
  onChange: (draft: ChoiceQuestionDraft) => void;
  disabled?: boolean;
}

const ChoicesEditor: React.FunctionComponent<ChoicesEditorProps> = ({
  draft,
  onChange,
  disabled,
}) => {
  // Radios group by name across the page, so each editor needs its own.
  const markerName = useId();
  const {correctChoiceIds} = draft;
  const isMultipleSelect = isMultipleSelectDraft(draft);

  const setCorrectChoiceIds = (ids: string[]) =>
    onChange({...draft, correctChoiceIds: ids});

  const toggleCorrect = (id: string) => {
    if (!isMultipleSelect) {
      setCorrectChoiceIds([id]);
    } else if (correctChoiceIds.includes(id)) {
      setCorrectChoiceIds(correctChoiceIds.filter(other => other !== id));
    } else {
      setCorrectChoiceIds([...correctChoiceIds, id]);
    }
  };

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
      correctChoiceIds: correctChoiceIds.filter(other => other !== id),
    });
  };

  const addChoice = () => {
    const id = nextChoiceId(draft.choices.map(choice => choice.id));
    onChange({...draft, choices: [...draft.choices, {id, text: ''}]});
  };

  return (
    <>
      <FieldGroup label="Selection type:">
        <SegmentedButtons
          size="s"
          selectedButtonValue={draft.type}
          onChange={value => {
            const type = value as ChoiceQuestionDraft['type'];
            // Multiple choice keeps only the first correct choice.
            onChange({
              ...draft,
              type,
              correctChoiceIds:
                type === 'MultipleChoiceQuestion'
                  ? correctChoiceIds.slice(0, 1)
                  : correctChoiceIds,
            });
          }}
          buttons={CHOICE_TYPES.map(type => ({
            value: type,
            label: QUESTION_TYPE_LABELS_ICONS[type].label,
            iconLeft: {iconName: QUESTION_TYPE_LABELS_ICONS[type].iconName},
            disabled,
          }))}
        />
      </FieldGroup>
      <FieldGroup label="Options" className={styles.optionsField}>
        <div className={styles.optionsList}>
          {draft.choices.map((choice, index) => {
            const isCorrect = correctChoiceIds.includes(choice.id);
            const position = index + 1;
            // Named by the option's text; a new option has none yet.
            const markerLabel = `Correct answer: ${
              choice.text.trim() || `option ${position}`
            }`;
            return (
              <div key={choice.id} className={styles.optionRow}>
                <div className={styles.optionInput}>
                  <div className={styles.correctMarker}>
                    {isMultipleSelect ? (
                      <Checkbox
                        name={`${markerName}-${choice.id}`}
                        ariaLabel={markerLabel}
                        size="s"
                        checked={isCorrect}
                        onChange={() => toggleCorrect(choice.id)}
                        disabled={disabled}
                      />
                    ) : (
                      <RadioButton
                        name={markerName}
                        value={choice.id}
                        ariaLabel={markerLabel}
                        size="s"
                        checked={isCorrect}
                        onChange={() => toggleCorrect(choice.id)}
                        disabled={disabled}
                      />
                    )}
                  </div>
                  <TextField
                    name={`choice-${choice.id}`}
                    aria-label={`Option ${position} text`}
                    size="s"
                    color="gray"
                    className={classNames(
                      styles.fullWidthField,
                      styles.optionText
                    )}
                    value={choice.text}
                    onChange={e => updateChoiceText(choice.id, e.target.value)}
                    disabled={disabled}
                  />
                </div>
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
          <AddItemButton
            label="Add option"
            onClick={addChoice}
            disabled={disabled}
          />
        </div>
      </FieldGroup>
    </>
  );
};

export default ChoicesEditor;
