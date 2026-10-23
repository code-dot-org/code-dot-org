import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import {IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {formatChoiceLetter} from '../../utils';
import AddItemButton from '../AddItemButton';
import {QUESTION_TYPE_LABELS_ICONS} from '../constants';
import {ChoiceQuestionDraft} from '../types';

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

function correctChoiceIdsOf(draft: ChoiceQuestionDraft): string[] {
  if (draft.type === 'MultipleSelectQuestion') {
    return draft.correctChoiceIds;
  }
  return draft.correctChoiceId === null ? [] : [draft.correctChoiceId];
}

// Multiple choice keeps only the first correct choice.
function withCorrectChoiceIds(
  draft: ChoiceQuestionDraft,
  type: ChoiceQuestionDraft['type'],
  correctChoiceIds: string[]
): ChoiceQuestionDraft {
  const {questionName, questionTitle, description, explanation, choices} =
    draft;
  const shared = {
    questionName,
    questionTitle,
    description,
    explanation,
    choices,
  };
  return type === 'MultipleSelectQuestion'
    ? {...shared, type, correctChoiceIds}
    : {...shared, type, correctChoiceId: correctChoiceIds[0] ?? null};
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
  questionId: number;
}

const ChoicesEditor: React.FunctionComponent<ChoicesEditorProps> = ({
  draft,
  onChange,
  disabled,
  questionId,
}) => {
  const correctChoiceIds = correctChoiceIdsOf(draft);
  const isMultipleSelect = draft.type === 'MultipleSelectQuestion';

  const setCorrectChoiceIds = (ids: string[]) =>
    onChange(withCorrectChoiceIds(draft, draft.type, ids));

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
    onChange(
      withCorrectChoiceIds(
        {...draft, choices: draft.choices.filter(choice => choice.id !== id)},
        draft.type,
        correctChoiceIds.filter(other => other !== id)
      )
    );
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
          onChange={type =>
            onChange(
              withCorrectChoiceIds(
                draft,
                type as ChoiceQuestionDraft['type'],
                correctChoiceIds
              )
            )
          }
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
            const markerLabel = `Option ${formatChoiceLetter(
              index
            )} is correct`;
            return (
              <div key={choice.id} className={styles.optionRow}>
                <div className={styles.optionInput}>
                  <div className={styles.correctMarker}>
                    {isMultipleSelect ? (
                      <Checkbox
                        name={`question-${questionId}-correct-${choice.id}`}
                        ariaLabel={markerLabel}
                        size="s"
                        checked={isCorrect}
                        onChange={() => toggleCorrect(choice.id)}
                        disabled={disabled}
                      />
                    ) : (
                      <RadioButton
                        name={`question-${questionId}-correct`}
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
                    aria-label="Choice text"
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
