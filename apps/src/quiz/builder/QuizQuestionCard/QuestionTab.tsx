import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import React from 'react';

import {QuizQuestionDraft} from '../types';

import styles from './quiz-question-card.module.scss';
import builderCommonStyles from '../builder-common.module.scss';

interface QuestionTabProps {
  draft: QuizQuestionDraft;
  onChange: (draft: QuizQuestionDraft) => void;
  disabled?: boolean;
  nameFieldRef?: React.Ref<HTMLInputElement>;
}

const QuestionTab: React.FunctionComponent<QuestionTabProps> = ({
  draft,
  onChange,
  disabled,
  nameFieldRef,
}) => (
  <div className={builderCommonStyles.section}>
    <TextField
      ref={nameFieldRef}
      name="questionName"
      label="Internal name"
      size="s"
      color="gray"
      className={styles.fullWidthField}
      value={draft.questionName}
      onChange={e => onChange({...draft, questionName: e.target.value})}
      disabled={disabled}
    />
    <TextField
      name="questionTitle"
      label="Question title"
      size="s"
      color="gray"
      className={styles.fullWidthField}
      value={draft.questionTitle}
      onChange={e => onChange({...draft, questionTitle: e.target.value})}
      disabled={disabled}
    />
    <FormFieldWrapper label="Description (optional, markdown supported)">
      <textarea
        className={builderCommonStyles.textarea}
        name="description"
        rows={5}
        value={draft.description ?? ''}
        onChange={e => onChange({...draft, description: e.target.value})}
        disabled={disabled}
      />
    </FormFieldWrapper>
  </div>
);

export default QuestionTab;
