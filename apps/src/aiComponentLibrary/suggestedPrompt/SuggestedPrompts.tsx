import React from 'react';

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
  const hasSelection = suggestedPrompts.some(prompt => prompt.selected);
  const visiblePrompts = suggestedPrompts.filter(prompt => prompt.show);

  return (
    <div
      className={moduleStyles.prompts}
      role="group"
      aria-label="Suggested Prompts"
    >
      {visiblePrompts.map((prompt, index) => {
        const isDisabled = hasSelection && !prompt.selected;

        return (
          <button
            key={prompt.label}
            type="button"
            className={`${moduleStyles.prompt} ${
              prompt.selected ? moduleStyles.selected : ''
            } ${isDisabled ? moduleStyles.disabled : ''}`}
            onClick={() => !isDisabled && prompt.onClick(prompt)}
            disabled={isDisabled}
            aria-pressed={prompt.selected}
            aria-label={prompt.label}
          >
            <span>{prompt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
export default SuggestedPrompts;
