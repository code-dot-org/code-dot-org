import TextField from '@code-dot-org/component-library/textField';
import React from 'react';

import {QuizQuestionEditableFields} from '../types';

import styles from './quiz-question-card.module.scss';
import builderCommonStyles from '../builder-common.module.scss';

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
  <div className={builderCommonStyles.section}>
    <TextField
      name="questionName"
      label="Internal name"
      size="m"
      className={styles.fullWidthField}
      value={draft.questionName}
      onChange={e => onChange({...draft, questionName: e.target.value})}
      disabled={disabled}
    />
    <TextField
      name="questionTitle"
      label="Question title"
      size="m"
      className={styles.fullWidthField}
      value={draft.questionTitle}
      onChange={e => onChange({...draft, questionTitle: e.target.value})}
      disabled={disabled}
    />
  </div>
);

export default QuestionTab;
