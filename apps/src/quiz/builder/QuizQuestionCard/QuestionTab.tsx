import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useId} from 'react';

import {QuizQuestionDraft} from '../types';

import styles from './quiz-question-card.module.scss';
import builderCommonStyles from '../builder-common.module.scss';

interface QuestionTabProps {
  draft: QuizQuestionDraft;
  onChange: (draft: QuizQuestionDraft) => void;
  disabled?: boolean;
  nameFieldRef?: React.Ref<HTMLInputElement>;
}

// Rendered outside the field's label so it's announced as a description
// rather than as part of the field's name.
const FieldHelp: React.FunctionComponent<{id: string; text: string}> = ({
  id,
  text,
}) => (
  <Typography
    id={id}
    variant="body4"
    component="p"
    className={styles.fieldHelp}
  >
    <FontAwesomeV6Icon
      iconName="circle-info"
      className={styles.fieldHelpIcon}
    />
    {text}
  </Typography>
);

const QuestionTab: React.FunctionComponent<QuestionTabProps> = ({
  draft,
  onChange,
  disabled,
  nameFieldRef,
}) => {
  const nameHelpId = useId();
  const titleHelpId = useId();
  const descriptionHelpId = useId();

  return (
    <div className={builderCommonStyles.section}>
      <div className={styles.field}>
        <TextField
          ref={nameFieldRef}
          name="questionName"
          label="Internal name*"
          size="s"
          color="gray"
          className={styles.fullWidthField}
          value={draft.questionName}
          onChange={e => onChange({...draft, questionName: e.target.value})}
          disabled={disabled}
          aria-required
          aria-describedby={nameHelpId}
        />
        <FieldHelp
          id={nameHelpId}
          text="Not shown to students. A short label to help you find and group this question."
        />
      </div>
      <div className={styles.field}>
        <TextField
          name="questionTitle"
          label="Question title*"
          size="s"
          color="gray"
          className={styles.fullWidthField}
          value={draft.questionTitle}
          onChange={e => onChange({...draft, questionTitle: e.target.value})}
          disabled={disabled}
          aria-required
          aria-describedby={titleHelpId}
        />
        <FieldHelp
          id={titleHelpId}
          text="The main question text students see. For a simple question, this can be the whole question."
        />
      </div>
      <div className={styles.field}>
        <FormFieldWrapper
          label="Description (optional)"
          size="s"
          color="gray"
          className={styles.fullWidthField}
        >
          <textarea
            className={builderCommonStyles.textarea}
            name="description"
            rows={5}
            value={draft.description ?? ''}
            onChange={e => onChange({...draft, description: e.target.value})}
            disabled={disabled}
            aria-describedby={descriptionHelpId}
          />
        </FormFieldWrapper>
        <FieldHelp
          id={descriptionHelpId}
          text="Additional context, instructions or content (e.g. a code snippet) shown below the title. Supports Markdown."
        />
      </div>
    </div>
  );
};

export default QuestionTab;
