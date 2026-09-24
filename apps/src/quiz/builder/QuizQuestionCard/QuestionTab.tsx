import TextField from '@code-dot-org/component-library/textField';
import React from 'react';

import {QuizQuestionEditableFields} from '../types';

import styles from './quiz-question-card.module.scss';

interface QuestionTabProps {
  draft: QuizQuestionEditableFields;
  onChange: (draft: QuizQuestionEditableFields) => void;
  disabled?: boolean;
}

const QuestionTab: React.FunctionComponent<QuestionTabProps> = ({
  draft,
  onChange,
  disabled,
}) => (
  <div className={styles.tabContent}>
    <TextField
      name="questionName"
      label="Internal name"
      size="m"
      value={draft.questionName}
      onChange={e => onChange({...draft, questionName: e.target.value})}
      disabled={disabled}
    />
    <TextField
      name="stem"
      label="Question title"
      size="m"
      value={draft.stem}
      onChange={e => onChange({...draft, stem: e.target.value})}
      disabled={disabled}
    />
  </div>
);

export default QuestionTab;
