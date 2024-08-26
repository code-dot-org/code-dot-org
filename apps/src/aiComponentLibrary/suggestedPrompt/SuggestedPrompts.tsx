import React from 'react';

import Chips from '@cdo/apps/componentLibrary/chips';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders clickable tags that can be customized with list of suggested prompts.
 */
export interface SuggestedPrompt {
  onClick: (prompt: SuggestedPrompt) => void;
  label: string;
  show: boolean;
  selected: boolean;
}

interface SuggestedPromptsProps {
  suggestedPrompts: Array<SuggestedPrompt>;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  suggestedPrompts,
}) => {
  const setValues = (selected: string[]) => {
    suggestedPrompts.map(prompt => {
      if (prompt.selected !== selected.includes(prompt.label)) {
        prompt.onClick(prompt);
      }
    });
  };

  return (
    <Chips
      options={suggestedPrompts.map(prompt => {
        return {label: prompt.label, value: prompt.label};
      })}
      values={suggestedPrompts.map((prompt, id) => {
        return prompt.selected ? prompt.label : '';
      })}
      setValues={setValues}
      name={'Suggested Prompts'}
      size={'s'}
      textThickness={'thick'}
      className={moduleStyles.prompts}
    />
  );
};
export default SuggestedPrompts;
