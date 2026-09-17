import TextField from '@code-dot-org/component-library/textField';
import React from 'react';

import {QuizQuestionEditableFields} from '../types';

import styles from '../quiz-question-card.module.scss';

interface QuestionTabProps {
  draft: QuizQuestionEditableFields;
  onChange: (draft: QuizQuestionEditableFields) => void;
}

// The Question tab: identity fields only. Description (rich text, shown in
// the Figma design) has no backend field yet, so it's left out for now.
const QuestionTab: React.FunctionComponent<QuestionTabProps> = ({
  draft,
  onChange,
}) => (
  <div className={styles.tabContent}>
    <TextField
      name="questionName"
      label="Internal name"
      size="m"
      value={draft.questionName}
      onChange={e => onChange({...draft, questionName: e.target.value})}
    />
    <TextField
      name="stem"
      label="Question title"
      size="m"
      value={draft.stem}
      onChange={e => onChange({...draft, stem: e.target.value})}
    />
  </div>
);

export default QuestionTab;
