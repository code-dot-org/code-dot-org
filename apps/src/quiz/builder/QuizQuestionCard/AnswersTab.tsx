import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {IconButton, Button} from '@mui/material';
import React from 'react';

import {QuizQuestionEditableFields} from '../types';

import nextChoiceId from './nextChoiceId';

import styles from '../quiz-question-card.module.scss';

interface AnswersTabProps {
  questionId: number;
  draft: QuizQuestionEditableFields;
  onChange: (draft: QuizQuestionEditableFields) => void;
}

// MultipleChoiceQuestion#validate_choices rejects fewer than 2 choices.
const MIN_CHOICES = 2;

// The Answers tab: choices, which one is correct, and an optional
// explanation. Only ever single-correct (radio, not checkbox) - the
// backend has no way to store more than one correctChoiceId yet.
const AnswersTab: React.FunctionComponent<AnswersTabProps> = ({
  questionId,
  draft,
  onChange,
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
    <div className={styles.tabContent}>
      <div className={styles.optionsList}>
        {draft.choices.map(choice => (
          <div key={choice.id} className={styles.optionRow}>
            <TextField
              name={`choice-${choice.id}`}
              aria-label="Choice text"
              size="m"
              className={styles.optionText}
              value={choice.text}
              onChange={e => updateChoiceText(choice.id, e.target.value)}
            />
            <RadioButton
              name={`correct-choice-${questionId}`}
              value={choice.id}
              ariaLabel="Mark as correct answer"
              checked={draft.correctChoiceId === choice.id}
              onChange={() => onChange({...draft, correctChoiceId: choice.id})}
            />
            <IconButton
              aria-label="Delete choice"
              size="small"
              color="error"
              type="button"
              disabled={draft.choices.length <= MIN_CHOICES}
              onClick={() => removeChoice(choice.id)}
            >
              <FontAwesomeV6Icon iconName="trash" />
            </IconButton>
          </div>
        ))}
      </div>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        type="button"
        onClick={addChoice}
        startIcon={<FontAwesomeV6Icon iconName="plus" />}
      >
        Add option
      </Button>

      <FormFieldWrapper label="Answer explanation (optional)">
        <textarea
          className={styles.textarea}
          name="explanation"
          rows={4}
          value={draft.explanation ?? ''}
          onChange={e => onChange({...draft, explanation: e.target.value})}
        />
      </FormFieldWrapper>
    </div>
  );
};

export default AnswersTab;
