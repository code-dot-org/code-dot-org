import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import React from 'react';

import {QuizQuestionDraft} from '../types';

import ChoicesEditor from './ChoicesEditor';
import PairsEditor from './PairsEditor';

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
    {(draft.type === 'MultipleChoiceQuestion' ||
      draft.type === 'MultipleSelectQuestion') && (
      <ChoicesEditor draft={draft} onChange={onChange} disabled={disabled} />
    )}
    {draft.type === 'MatchQuestion' && (
      <PairsEditor draft={draft} onChange={onChange} disabled={disabled} />
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
