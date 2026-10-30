import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import React from 'react';

import {isChoiceQuestionDraft, isMatchDraft, QuizQuestionDraft} from '../types';

import ChoicesEditor from './ChoicesEditor';
import PairsEditor from './PairsEditor';

import styles from './quiz-question-card.module.scss';
import builderCommonStyles from '../builder-common.module.scss';

interface AnswersTabProps {
  draft: QuizQuestionDraft;
  onChange: (draft: QuizQuestionDraft) => void;
  disabled?: boolean;
}

const AnswersTab: React.FunctionComponent<AnswersTabProps> = ({
  draft,
  onChange,
  disabled,
}) => (
  <div className={builderCommonStyles.section}>
    {isChoiceQuestionDraft(draft) && (
      <ChoicesEditor draft={draft} onChange={onChange} disabled={disabled} />
    )}
    {isMatchDraft(draft) && (
      <PairsEditor draft={draft} onChange={onChange} disabled={disabled} />
    )}

    <FormFieldWrapper
      label="Answer explanation (optional)"
      size="s"
      color="gray"
      className={styles.fullWidthField}
    >
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
